package com.ecommerce.common.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

public class LoggingUtils {

    private static final Logger logger = LoggerFactory.getLogger(LoggingUtils.class);

    // Log message with correlation ID and user context
    public static void logInfo(String message) {
        String correlationId = MDC.get("correlationId");
        String userInfo = getUserInfo();

        logger.info("correlationId: {}, user: {} - {}", correlationId, userInfo, message);
    }

    // Log warning with correlation ID and user context
    public static void logWarning(String message) {
        String correlationId = MDC.get("correlationId");
        String userInfo = getUserInfo();

        logger.warn("correlationId: {}, user: {} - {}", correlationId, userInfo, message);
    }

    // Log error with correlation ID and user context
    public static void logError(String message, Throwable ex) {
        String correlationId = MDC.get("correlationId");
        String userInfo = getUserInfo();

        logger.error("correlationId: {}, user: {} - {}", correlationId, userInfo, message, ex);
    }

    // Get user information from security context
    private static String getUserInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDetails) {
                return ((UserDetails) principal).getUsername();
            } else {
                return principal.toString();
            }
        }
        return "anonymous";
    }
}