package com.ecommerce.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class RequestCorrelationFilter extends OncePerRequestFilter {

    private static final String CORRELATION_ID_HEADER_NAME = "X-Correlation-Id";
    private static final String CORRELATION_ID_MDC_KEY = "correlationId";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException, IOException {
        try {
            // Pehle se agar koi correlation ID hai request mein to use karo, nahi to naya generate karo
            String correlationId = request.getHeader(CORRELATION_ID_HEADER_NAME);
            if (correlationId == null || correlationId.isEmpty()) {
                correlationId = UUID.randomUUID().toString();
            }

            // Response mein correlation ID header set karo
            response.setHeader(CORRELATION_ID_HEADER_NAME, correlationId);
            // MDC mein correlation ID set karo taki logs mein dikhe
            MDC.put(CORRELATION_ID_MDC_KEY, correlationId);

            filterChain.doFilter(request, response);
        } finally {
            // Request khatam hone par MDC clear karo
            MDC.remove(CORRELATION_ID_MDC_KEY);
        }
    }
}