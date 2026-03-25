package com.founderlink.auth.controller;

import com.founderlink.auth.dto.*;
import com.founderlink.auth.entity.AccountStatus;
import com.founderlink.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication Service", description = "Management of User Registration and JWT Login")
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;

    public AuthController(AuthService authService, AuthenticationManager authenticationManager) {
        this.authService = authService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    @Operation(summary = "Create a new User account", description = "Registers a new user in the system. Status will be PENDING.")
    public ResponseEntity<AuthResponse> addNewUser(@Valid @RequestBody UserRegisterRequest user) {
        return new ResponseEntity<>(authService.saveUser(user), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Login and generate JWT token", description = "Authenticates user and returns access and refresh tokens")
    public ResponseEntity<AuthResponse> getToken(@Valid @RequestBody AuthRequest authRequest) {
        Authentication authenticate = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );
        
        if (authenticate.isAuthenticated()) {
            return ResponseEntity.ok(authService.login(authRequest.getEmail()));
        } else {
            throw new RuntimeException("Invalid access");
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh expired token", description = "Generates a new valid JWT using a refresh token")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Deletes the refresh token from database")
    public ResponseEntity<String> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate Token", description = "Checks if a JWT token is still valid")
    public ResponseEntity<String> validateToken(@RequestHeader("Authorization") String authHeader) {
        authService.validateToken(authHeader);
        return ResponseEntity.ok("Token is valid");
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Update User Status (Admin)", description = "Approve, Reject, or Suspend a user account")
    public ResponseEntity<String> updateUserStatus(@PathVariable("id") Long id, @RequestParam("status") AccountStatus status) {
        return ResponseEntity.ok(authService.updateUserStatus(id, status));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "List Pending Users (Admin)", description = "Returns a list of all user accounts awaiting approval")
    public ResponseEntity<List<UserDTO>> getPendingUsers() {
        return ResponseEntity.ok(authService.getPendingUsers());
    }
}
