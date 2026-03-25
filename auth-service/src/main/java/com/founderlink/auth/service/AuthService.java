package com.founderlink.auth.service;

import com.founderlink.auth.dto.*;
import com.founderlink.auth.entity.*;
import com.founderlink.auth.exception.*;
import com.founderlink.auth.repository.RoleRepository;
import com.founderlink.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    private static final Set<String> ALLOWED_ROLES = Set.of(
            "ROLE_FOUNDER", "ROLE_INVESTOR", "ROLE_COFOUNDER"
    );

    public AuthService(UserRepository userRepository, 
                       RoleRepository roleRepository, 
                       PasswordEncoder passwordEncoder, 
                       JwtService jwtService,
                       RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public AuthResponse saveUser(UserRegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("Email is already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus(AccountStatus.PENDING);
        
        Set<Role> userRoles = new HashSet<>();
        List<String> requestedRoles = new ArrayList<>();
        
        if (request.getRole() != null) requestedRoles.add(request.getRole().toUpperCase());
        if (request.getRoles() != null) requestedRoles.addAll(request.getRoles().stream().map(String::toUpperCase).toList());

        for (String roleName : requestedRoles) {
            if ("ROLE_ADMIN".equals(roleName)) {
                throw new InvalidRoleRequestException("Self-registration as ADMIN is strictly prohibited");
            }
            if (!ALLOWED_ROLES.contains(roleName)) {
                throw new InvalidRoleRequestException("Invalid role requested: " + roleName + ". Allowed: " + ALLOWED_ROLES);
            }
            userRoles.add(getOrCreateRole(roleName));
        }
        
        if (userRoles.isEmpty()) {
            throw new InvalidRoleRequestException("At least one role must be requested (FOUNDER, INVESTOR, or COFOUNDER)");
        }
        
        user.setRoles(userRoles);
        User savedUser = userRepository.save(user);

        return AuthResponse.builder()
                .message("User registration successful! Awaiting Admin approval.")
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .accountStatus(savedUser.getStatus())
                .roles(savedUser.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .build();
    }

    private Role getOrCreateRole(String roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(roleName);
                    return roleRepository.save(newRole);
                });
    }

    public AuthResponse login(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (user.getStatus() != AccountStatus.APPROVED) {
            throw new AccountNotApprovedException("Your account status is: " + user.getStatus());
        }

        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        String accessToken = jwtService.generateToken(email, roles, user.getId());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(email);

        return AuthResponse.builder()
                .message("Login successful")
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .roles(roles)
                .accountStatus(user.getStatus())
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        return refreshTokenService.findByToken(request.getRefreshToken())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    Set<String> roles = user.getRoles().stream()
                            .map(Role::getName)
                            .collect(Collectors.toSet());
                    String accessToken = jwtService.generateToken(user.getEmail(), roles, user.getId());
                    return AuthResponse.builder()
                            .message("Token refreshed successfully")
                            .accessToken(accessToken)
                            .refreshToken(request.getRefreshToken())
                            .tokenType("Bearer")
                            .userId(user.getId())
                            .email(user.getEmail())
                            .roles(roles)
                            .accountStatus(user.getStatus())
                            .build();
                })
                .orElseThrow(() -> new TokenRefreshException("Refresh token is expired or not in database!"));
    }

    public void validateToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new InvalidCredentialsException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        jwtService.validateToken(token);
    }

    @Transactional
    public void logout(String refreshToken) {
        String currentEmail = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        if (currentEmail == null || "anonymousUser".equals(currentEmail)) {
            throw new InvalidCredentialsException("User not authenticated.");
        }
        refreshTokenService.deleteByToken(refreshToken, currentEmail);
    }

    @Transactional
    public String updateUserStatus(Long userId, AccountStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        user.setStatus(status);
        userRepository.save(user);
        return "User status updated to " + status;
    }

    public List<UserDTO> getPendingUsers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getStatus() == AccountStatus.PENDING)
                .map(this::convertToDTO)
                .toList();
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .build();
    }
}
