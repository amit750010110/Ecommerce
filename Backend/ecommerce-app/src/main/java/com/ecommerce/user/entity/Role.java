package com.ecommerce.user.entity;

import org.springframework.security.core.GrantedAuthority;

public enum Role implements GrantedAuthority {
    ANONYMOUS,      // Unauthenticated users
    CUSTOMER,       // Registered customers
    ADMIN;          // Administrative users

    @Override
    public String getAuthority() {
        return "ROLE_" + name();
    }
}
