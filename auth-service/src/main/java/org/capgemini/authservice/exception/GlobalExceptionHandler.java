package org.capgemini.authservice.exception;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global Exception Handler for auth-service.
 *
 * Catches exceptions thrown from any controller and returns a clean,
 * structured JSON response instead of a raw Spring error page.
 *
 * @RestControllerAdvice = @ControllerAdvice + @ResponseBody
 * (applies globally to all @RestController classes)
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ─────────────────────────────────────────────────────────────────────────
    // 1. VALIDATION ERRORS  →  400 Bad Request
    //    Triggered when @Valid fails on @RequestBody (e.g., @NotBlank, @Email)
    // ─────────────────────────────────────────────────────────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        // Collect all field-level validation errors into one message
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }

        // Build a readable message like: "name: must not be blank | email: must be a valid email"
        String message = fieldErrors.entrySet().stream()
                .map(e -> e.getKey() + ": " + e.getValue())
                .reduce((a, b) -> a + " | " + b)
                .orElse("Validation failed");

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(400, "Validation Failed", message, request.getRequestURI()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. BAD CREDENTIALS  →  401 Unauthorized
    //    Thrown by AuthenticationManager when email/password is wrong
    // ─────────────────────────────────────────────────────────────────────────
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex,
            HttpServletRequest request) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(401, "Unauthorized", "Invalid email or password", request.getRequestURI()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. ACCOUNT DISABLED  →  401 Unauthorized
    //    Thrown when user account is disabled
    // ─────────────────────────────────────────────────────────────────────────
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ErrorResponse> handleDisabledException(
            DisabledException ex,
            HttpServletRequest request) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(401, "Unauthorized", "User account is disabled", request.getRequestURI()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. ACCOUNT LOCKED  →  401 Unauthorized
    //    Thrown when user account is locked
    // ─────────────────────────────────────────────────────────────────────────
    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ErrorResponse> handleLockedException(
            LockedException ex,
            HttpServletRequest request) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(401, "Unauthorized", "User account is locked", request.getRequestURI()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. ACCESS DENIED  →  403 Forbidden
    //    Thrown when a logged-in user calls an endpoint they don't have role for
    //    e.g., INVESTOR trying to call an endpoint marked @PreAuthorize("hasRole('ADMIN')")
    // ─────────────────────────────────────────────────────────────────────────
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(403, "Forbidden",
                        "You do not have permission to access this resource", request.getRequestURI()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. JWT EXPIRED  →  401 Unauthorized
    //    Thrown when JWT token has passed its expiry time (1 hour)
    // ─────────────────────────────────────────────────────────────────────────
    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<ErrorResponse> handleExpiredJwt(
            ExpiredJwtException ex,
            HttpServletRequest request) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(401, "Token Expired",
                        "Your session has expired. Please login again.", request.getRequestURI()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 7. JWT INVALID / MALFORMED / TAMPERED  →  401 Unauthorized
    //    Thrown when the JWT signature doesn't match or the token is garbage
    // ─────────────────────────────────────────────────────────────────────────
    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ErrorResponse> handleJwtException(
            JwtException ex,
            HttpServletRequest request) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(401, "Invalid Token",
                        "JWT token is invalid or tampered: " + ex.getMessage(), request.getRequestURI()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 8. MISSING REQUEST HEADER  →  400 Bad Request
    //    Thrown when a required @RequestHeader is absent
    //    e.g., calling /auth/validate without Authorization header
    // ─────────────────────────────────────────────────────────────────────────
    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ErrorResponse> handleMissingHeader(
            MissingRequestHeaderException ex,
            HttpServletRequest request) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(400, "Bad Request",
                        "Required header is missing: " + ex.getHeaderName(), request.getRequestURI()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 9. MISSING REQUEST PARAMETER  →  400 Bad Request
    //    Thrown when a required @RequestParam is absent
    //    e.g., calling /auth/validate without ?token=...
    // ─────────────────────────────────────────────────────────────────────────
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(
            MissingServletRequestParameterException ex,
            HttpServletRequest request) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(400, "Bad Request",
                        "Required parameter is missing: " + ex.getParameterName(), request.getRequestURI()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 10. TYPE MISMATCH  →  400 Bad Request
    //     Thrown when a @PathVariable or @RequestParam has the wrong type
    //     e.g., /auth/user/abc when the method expects a Long
    // ─────────────────────────────────────────────────────────────────────────
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex,
            HttpServletRequest request) {

        String message = String.format("Parameter '%s' must be of type '%s'",
                ex.getName(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(400, "Bad Request", message, request.getRequestURI()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 11. DATABASE CONSTRAINT VIOLATION  →  409 Conflict
    //     Thrown when trying to save a duplicate unique field (e.g., duplicate email)
    //     This is a database-level safety net (controller already checks, but just in case)
    // ─────────────────────────────────────────────────────────────────────────
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(409, "Conflict",
                        "A record with this data already exists (e.g., email is already registered)",
                        request.getRequestURI()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 12. ILLEGAL ARGUMENT  →  400 Bad Request
    //     Thrown when a RuntimeException wraps a "Role not found" or similar issue
    // ─────────────────────────────────────────────────────────────────────────
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(400, "Bad Request", ex.getMessage(), request.getRequestURI()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 13. RUNTIME EXCEPTION  →  500 Internal Server Error
    //     Catches generic RuntimeExceptions that don't match any handler above
    //     e.g., "Role not found" orElseThrow(() -> new RuntimeException(...))
    // ─────────────────────────────────────────────────────────────────────────
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(
            RuntimeException ex,
            HttpServletRequest request) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(500, "Internal Server Error", ex.getMessage(), request.getRequestURI()));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 14. CATCH-ALL  →  500 Internal Server Error
    //     Last resort — catches ANY unhandled Exception
    //     Prevents Spring from leaking stack traces to the client
    // ─────────────────────────────────────────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request) {

        // Log it for debugging (replace with proper logger in production)
        System.err.println("Unhandled exception at " + request.getRequestURI() + ": " + ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(500, "Internal Server Error",
                        "An unexpected error occurred. Please try again later.", request.getRequestURI()));
    }
}
