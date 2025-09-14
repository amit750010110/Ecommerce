//package com.ecommerce.user.service;
//
//import com.ecommerce.user.entity.User;
//import com.ecommerce.user.repository.UserRepository;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.Set;
//import java.util.stream.Collectors;
//
//@Service
//@Slf4j
//public class CustomUserDetailsService implements UserDetailsService {
//
//    private final UserRepository userRepository;
//
//    public CustomUserDetailsService(UserRepository userRepository) {
//        this.userRepository = userRepository;
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//        log.info("Loading user by username: {}", username);
//
//        User user = userRepository.findByUsername(username)
//                .orElseThrow(() -> {
//                    log.warn("User not found with username: {}", username);
//                    return new UsernameNotFoundException("User not found with username: " + username);
//                });
//
//        Set<SimpleGrantedAuthority> authorities = user.getRoles().stream()
//                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
//                .collect(Collectors.toSet());
//
//        log.info("User found: {}, with roles: {}", username, user.getRoles());
//
//        return new org.springframework.security.core.userdetails.User(
//                user.getUsername(),
//                user.getPassword(),
//                user.isActive(),
//                true,
//                true,
//                true,
//                authorities
//        );
//    }
//}
