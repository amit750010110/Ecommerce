package com.ecommerce.user.controller;

import com.ecommerce.auth.dto.ApiResponse;
import com.ecommerce.common.util.LoggingUtils;
import com.ecommerce.user.dto.UpdateProfileRequest;
import com.ecommerce.user.dto.UserProfileDto;
import com.ecommerce.user.entity.User;
import com.ecommerce.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileDto>> getCurrentUser(@AuthenticationPrincipal User user) {
        try {
            UserProfileDto userProfile = userService.getUserProfile(user.getId());

            LoggingUtils.logInfo("User profile fetched: " + user.getEmail());
            return ResponseEntity.ok(new ApiResponse<>("User profile fetched successfully", userProfile));
        } catch (Exception ex) {
            LoggingUtils.logError("Error fetching user profile: " + user.getEmail(), ex);
            throw ex;
        }
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateProfileRequest request) {
        try {
            UserProfileDto updatedProfile = userService.updateUserProfile(user.getId(), request);

            LoggingUtils.logInfo("User profile updated: " + user.getEmail());
            return ResponseEntity.ok(new ApiResponse<>("Profile updated successfully", updatedProfile));
        } catch (Exception ex) {
            LoggingUtils.logError("Error updating user profile: " + user.getEmail(), ex);
            throw ex;
        }
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileDto>> getUserById(@PathVariable Long userId) {
        try {
            UserProfileDto userProfile = userService.getUserProfile(userId);

            LoggingUtils.logInfo("User profile fetched by admin: " + userId);
            return ResponseEntity.ok(new ApiResponse<>("User profile fetched successfully", userProfile));
        } catch (Exception ex) {
            LoggingUtils.logError("Error fetching user profile by admin: " + userId, ex);
            throw ex;
        }
    }
}
