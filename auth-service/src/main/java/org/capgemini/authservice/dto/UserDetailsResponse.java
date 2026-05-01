package org.capgemini.authservice.dto;

import java.time.LocalDateTime;
import java.util.List;

public class UserDetailsResponse {
    private Long id;
    private String name;
    private String email;
    private List<String> roles;
    private LocalDateTime createdAt;

    public UserDetailsResponse(Long id, String name, String email, List<String> roles, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.roles = roles;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public List<String> getRoles() {
        return roles;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
