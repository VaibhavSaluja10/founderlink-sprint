package org.capgemini.authservice.controller;

import jakarta.validation.Valid;
import org.capgemini.authservice.dto.JwtResponse;
import org.capgemini.authservice.dto.LoginRequest;
import org.capgemini.authservice.dto.MessageResponse;
import org.capgemini.authservice.dto.RegisterRequest;
import org.capgemini.authservice.dto.TokenValidationResponse;
import org.capgemini.authservice.dto.UserDetailsResponse;
import org.capgemini.authservice.entity.Role;
import org.capgemini.authservice.entity.RoleName;
import org.capgemini.authservice.entity.User;
import org.capgemini.authservice.repository.RoleRepository;
import org.capgemini.authservice.repository.UserRepository;
import org.capgemini.authservice.security.JwtUtils;
import org.capgemini.authservice.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        String strRole = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRole == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Role is required."));
        } else {
            switch (strRole.toUpperCase()) {
                case "ROLE_ADMIN":
                    return ResponseEntity.badRequest().body(new MessageResponse("Error: Cannot register as ADMIN."));
                case "ROLE_FOUNDER":
                    Role founderRole = roleRepository.findByName(RoleName.ROLE_FOUNDER)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    roles.add(founderRole);
                    break;
                case "ROLE_INVESTOR":
                    Role investorRole = roleRepository.findByName(RoleName.ROLE_INVESTOR)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    roles.add(investorRole);
                    break;
                case "ROLE_COFOUNDER":
                case "ROLE_COFUNDER":
                    Role coFounderRole = roleRepository.findByName(RoleName.ROLE_COFOUNDER)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    roles.add(coFounderRole);
                    break;
                default:
                    return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid role specified."));
            }
        }

        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setRoles(roles);

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // Throws BadCredentialsException if email/password is wrong
        // → caught automatically by GlobalExceptionHandler.handleBadCredentials()
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                                                 userDetails.getId(),
                                                 userDetails.getName(),
                                                 userDetails.getEmail(),
                                                 roles));
    }

    @PostMapping("/refresh")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> refreshToken(Authentication authentication) {
        // Simple token refresh: generate a new one for the currently authenticated admin
        String newJwt = jwtUtils.generateJwtToken(authentication);
        return ResponseEntity.ok(new MessageResponse("New Token: " + newJwt));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDetailsResponse>> getAllUsers() {
        List<UserDetailsResponse> users = userRepository.findAll().stream()
                .map(user -> new UserDetailsResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRoles().stream()
                                .map(role -> role.getName().name())
                                .collect(Collectors.toList()),
                        user.getCreatedAt()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam String token) {
        
        // 1. Check if Authorization header is present and valid
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("enter valid admin token , UNAUTHORIZED");
        }

        String adminToken = authHeader.substring(7);
        if (!jwtUtils.validateJwtToken(adminToken)) {
            return ResponseEntity.status(401).body("enter valid admin token , UNAUTHORIZED");
        }

        // 2. Check if the authenticated user has ADMIN role
        List<String> roles = jwtUtils.getRolesFromJwtToken(adminToken);
        if (roles == null || !roles.contains("ROLE_ADMIN")) {
            return ResponseEntity.status(401).body("enter valid admin token , UNAUTHORIZED");
        }

        // 3. Now validate the parameter 'token' (can be any of the 4 roles)
        boolean isValid = jwtUtils.validateJwtToken(token);
        if (isValid) {
            String email = jwtUtils.getUserNameFromJwtToken(token);
            // Must say 'valid token with her email' (using literal text from prompt)
            return ResponseEntity.ok("valid token with " + email);
        } else {
            return ResponseEntity.status(200).body("not valid token");
        }
    }
}
