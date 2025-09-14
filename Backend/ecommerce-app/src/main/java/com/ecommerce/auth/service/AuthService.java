package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.AuthResponse;
import com.ecommerce.auth.dto.LoginRequest;
import com.ecommerce.auth.dto.RegisterRequest;
import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.util.LoggingUtils;
import com.ecommerce.security.JwtTokenProvider;
import com.ecommerce.user.entity.Role;
import com.ecommerce.user.entity.User;
import com.ecommerce.user.service.UserService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.auth.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${app.auth.lock-time-minutes:10}")
    private int lockTimeMinutes;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       UserService userService,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {
        try {
            // Authentication manager se authenticate karo
                      Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            // Security context mein authentication set karo
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // JWT token generate karo
            String jwt = tokenProvider.generateToken(authentication);

            // Failed login attempts reset karo
            userService.resetFailedLoginAttempts(loginRequest.getEmail());

            User user = (User) authentication.getPrincipal();
            LoggingUtils.logInfo("User logged in successfully: " + loginRequest.getEmail());

            return new AuthResponse(jwt, user.getEmail(), user.getRoles());

        } catch (BadCredentialsException ex) {
            // Failed login attempt handle karo
            userService.incrementFailedLoginAttempts(loginRequest.getEmail(), maxFailedAttempts, lockTimeMinutes);
            LoggingUtils.logWarning("Invalid credentials for user: " + loginRequest.getEmail());
            throw new BusinessException("Invalid email or password");

        } catch (LockedException ex) {
            LoggingUtils.logWarning("Account locked for user: " + loginRequest.getEmail());
            throw new BusinessException("Account is locked. Please try again later.");

        } catch (Exception ex) {
            LoggingUtils.logError("Login failed for user: " + loginRequest.getEmail(), ex);
            throw new BusinessException("Login failed. Please try again.");
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        try {
            // Check if user already exists
            if (userService.existsByEmail(registerRequest.getEmail())) {
                LoggingUtils.logWarning("Registration failed - user already exists: " + registerRequest.getEmail());
                throw new BusinessException("Email is already registered");
            }

            // New user create karo
            User user = new User(
                    registerRequest.getEmail(),
                    passwordEncoder.encode(registerRequest.getPassword()),
                    registerRequest.getFirstName(),
                    registerRequest.getLastName()
            );

            // Default role set karo
            user.addRole(Role.CUSTOMER);

            // User save karo
            User savedUser = userService.save(user);

            // Authentication token generate karo
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    savedUser, null, savedUser.getAuthorities());

            String jwt = tokenProvider.generateToken(authentication);

            LoggingUtils.logInfo("User registered successfully: " + registerRequest.getEmail());
            return new AuthResponse(jwt, savedUser.getEmail(), savedUser.getRoles());

        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            LoggingUtils.logError("Registration failed for user: " + registerRequest.getEmail(), ex);
            throw new BusinessException("Registration failed. Please try again.");
        }
    }

    public void logout() {
        try {
            SecurityContextHolder.clearContext();
            LoggingUtils.logInfo("User logged out successfully");
        } catch (Exception ex) {
            LoggingUtils.logError("Logout failed", ex);
            throw new BusinessException("Logout failed");
        }
    }
}