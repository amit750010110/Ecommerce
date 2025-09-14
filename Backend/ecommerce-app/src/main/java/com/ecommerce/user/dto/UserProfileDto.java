package com.ecommerce.user.dto;

import com.ecommerce.user.entity.Role;
import lombok.Data;

import java.util.Set;

@Data
public class UserProfileDto {
    private Long id;
    private  String email;
    private String firstName;
    private  String lastName;
    private Set<Role> roles;
    private boolean enabled;
}
