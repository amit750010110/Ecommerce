package com.ecommerce.user.service;

import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.common.util.LoggingUtils;
import com.ecommerce.user.dto.UpdateProfileRequest;
import com.ecommerce.user.dto.UserProfileDto;
import com.ecommerce.user.entity.User;
import com.ecommerce.user.entity.Role;
import com.ecommerce.user.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService {


    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try {
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));

            LoggingUtils.logInfo("User loaded successfully: " + username);
            return user;
        } catch (UsernameNotFoundException ex) {
            LoggingUtils.logWarning("User not found: " + username);
            throw ex;
        } catch (Exception ex) {
            LoggingUtils.logError("Error loading user: " + username, ex);
            throw new UsernameNotFoundException("Error loading user", ex);
        }
    }

    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        try {
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        } catch (Exception ex) {
            LoggingUtils.logError("Error finding user by email: " + email, ex);
            throw ex;
        }
    }

    @Transactional
    public User save(User user) {
        try {
            User savedUser = userRepository.save(user);
            LoggingUtils.logInfo("User saved successfully: " + user.getEmail());
            return savedUser;
        } catch (Exception ex) {
            LoggingUtils.logError("Error saving user: " + user.getEmail(), ex);
            throw ex;
        }
    }

    @Transactional
    public void incrementFailedLoginAttempts(String email, int maxAttempts, int lockTimeMinutes) {
        try {
            User user = findByEmail(email);
            int newAttempts = user.getFailedLoginAttempts() + 1;

            if (newAttempts >= maxAttempts) {
                userRepository.updateFailedLoginAttempts(email, newAttempts,
                        java.time.LocalDateTime.now().plusMinutes(lockTimeMinutes));
                LoggingUtils.logWarning("User account locked: " + email);
            } else {
                userRepository.updateFailedLoginAttempts(email, newAttempts, null);
                LoggingUtils.logWarning("Failed login attempt for user: " + email);
            }
        } catch (Exception ex) {
            LoggingUtils.logError("Error incrementing failed login attempts for user: " + email, ex);
        }
    }

    @Transactional
    public void resetFailedLoginAttempts(String email) {
        try {
            userRepository.resetFailedLoginAttempts(email);
            LoggingUtils.logInfo("Reset failed login attempts for user: " + email);
        } catch (Exception ex) {
            LoggingUtils.logError("Error resetting failed login attempts for user: " + email, ex);
        }
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public UserProfileDto getUserProfile(Long userId) {
        try {
            User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

            UserProfileDto profile = new UserProfileDto();
            profile.setId(user.getId());
            profile.setEmail(user.getEmail());
            profile.setFirstName(user.getFirstname());
            profile.setLastName(user.getLastname());
            profile.setRoles(user.getRoles());
            profile.setEnabled(user.isEnabled());

            LoggingUtils.logInfo("User profile fetched: " + user.getEmail());
            return profile;
        } catch (Exception ex) {
            LoggingUtils.logError("Error fetching user profile: " + userId, ex);
            throw ex;
        }
    }

    @Transactional
    public UserProfileDto updateUserProfile(Long userId, UpdateProfileRequest request) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

            // Check if email is already taken by another user
            if (!user.getEmail().equals(request.getEmail()) &&
                    userRepository.existsByEmail(request.getEmail())) {
                throw new BusinessException("Email is already taken");
            }

            user.setFirstname(request.getFirstName());
            user.setLastname(request.getLastName());
            user.setEmail(request.getEmail());

            User updatedUser = userRepository.save(user);

            UserProfileDto profile = new UserProfileDto();
            profile.setId(updatedUser.getId());
            profile.setEmail(updatedUser.getEmail());
            profile.setFirstName(updatedUser.getFirstname());
            profile.setLastName(updatedUser.getLastname());
            profile.setRoles(updatedUser.getRoles());
            profile.setEnabled(updatedUser.isEnabled());

            LoggingUtils.logInfo("User profile updated: " + user.getEmail());
            return profile;
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            LoggingUtils.logError("Error updating user profile: " + userId, ex);
            throw new BusinessException("Failed to update profile");
        }
    }

    @Transactional(readOnly = true)
    public List<UserProfileDto> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();

            List<UserProfileDto> profiles = users.stream()
                    .map(user -> {
                        UserProfileDto profile = new UserProfileDto();
                        profile.setId(user.getId());
                        profile.setEmail(user.getEmail());
                        profile.setFirstName(user.getFirstname());
                        profile.setLastName(user.getLastname());
                        profile.setRoles(user.getRoles());
                        profile.setEnabled(user.isEnabled());
                        return profile;
                    })
                    .collect(Collectors.toList());

            LoggingUtils.logInfo("All users fetched by admin, count: " + profiles.size());
            return profiles;
        } catch (Exception ex) {
            LoggingUtils.logError("Error fetching all users", ex);
            throw new BusinessException("Failed to fetch users");
        }
    }

    @Transactional
    public void updateUserRoles(Long userId, Set<Role> roles) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

            user.setRoles(roles);
            userRepository.save(user);

            LoggingUtils.logInfo("User roles updated: " + user.getEmail() + ", roles: " + roles);
        } catch (Exception ex) {
            LoggingUtils.logError("Error updating user roles: " + userId, ex);
            throw new BusinessException("Failed to update user roles");
        }
    }
}