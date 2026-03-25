package com.founderlink.auth.dto;

import com.founderlink.auth.entity.AccountStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private Set<String> roles;
    private AccountStatus status;
    private LocalDateTime createdAt;
}
