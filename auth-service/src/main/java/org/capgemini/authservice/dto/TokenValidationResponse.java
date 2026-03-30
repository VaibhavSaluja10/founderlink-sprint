package org.capgemini.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TokenValidationResponse {
    private boolean valid;
    private String message;
    private String email;
    private List<String> roles;
}
