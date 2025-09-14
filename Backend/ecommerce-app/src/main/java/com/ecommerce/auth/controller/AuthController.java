package com.ecommerce.auth.controller;


import com.ecommerce.auth.dto.ApiResponse;
import com.ecommerce.auth.dto.AuthResponse;
import com.ecommerce.auth.dto.LoginRequest;
import com.ecommerce.auth.dto.RegisterRequest;
import com.ecommerce.auth.service.AuthService;
import com.ecommerce.common.util.LoggingUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse authResponse = authService.login(loginRequest);
            LoggingUtils.logInfo("Login API called successfully for user: " + loginRequest.getEmail());
            return ResponseEntity.ok(new ApiResponse<>("Login successful", authResponse));
        } catch (Exception ex) {
            LoggingUtils.logError("Login API failed for user: " + loginRequest.getEmail(), ex);
            throw ex;
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            AuthResponse authResponse = authService.register(registerRequest);
            LoggingUtils.logInfo("Registration API called successfully for user: " + registerRequest.getEmail());
            return ResponseEntity.ok(new ApiResponse<>("Registration successful", authResponse));
        } catch (Exception ex) {
            LoggingUtils.logError("Registration API failed for user: " + registerRequest.getEmail(), ex);
            throw ex;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        try {
            authService.logout();
            LoggingUtils.logInfo("Logout API called successfully");
            return ResponseEntity.ok(new ApiResponse<>("Logout successful", null));
        } catch (Exception ex) {
            LoggingUtils.logError("Logout API failed", ex);
            throw ex;
        }
    }
}