package com.ecommerce.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, UserDetailsService userDetailsService) {
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String correlationId = MDC.get("correlationId");
        String path = request.getRequestURI();

        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt)) {
                logger.info("Processing JWT authentication for path: {}, correlationId: {}", path, correlationId);

                if (tokenProvider.validateToken(jwt)) {
                    String username = tokenProvider.getUsernameFromJWT(jwt);

                    try {
                        // UserDetails ko load kiya ja raha hai
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        // SecurityContext mein authentication set kiya
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        logger.info("Authenticated user: {}, path: {}, correlationId: {}", username, path, correlationId);
                    } catch (UsernameNotFoundException ex) {
                        logger.warn("User not found for JWT token: {}, path: {}, correlationId: {}", username, path, correlationId);
                        // Clear the context if user not found
                        SecurityContextHolder.clearContext();
                    }
                } else {
                    logger.warn("Invalid JWT token received, path: {}, correlationId: {}", path, correlationId);
                }
            } else {
                logger.debug("No JWT token found in request, path: {}, correlationId: {}", path, correlationId);
            }
        } catch (Exception ex) {
            logger.error("Failed to process JWT authentication, path: {}, correlationId: {}, error: {}", path, correlationId, ex.getMessage(), ex);
            // Clear context in case of any error
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}