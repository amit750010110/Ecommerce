package com.ecommerce.auth.dto;

import com.ecommerce.user.entity.Role;
import lombok.Data;

import java.util.Set;

@Data
public class AuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String email;
    private Set<Role> roles;

    public AuthResponse(String accessToken, String email, Set<Role> roles) {
        this.accessToken = accessToken;
        this.email = email;
        this.roles = roles;
    }
}
