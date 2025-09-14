package com.ecommerce.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.ErrorResponse;

import java.io.IOException;


@Component
public class AccessDeniedHandlerImpl implements AccessDeniedHandler {

    private static final Logger logger = LoggerFactory.getLogger(AccessDeniedHandlerImpl.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, IOException {
        String correlationId = MDC.get("correlationId");
        String path = request.getRequestURI();

        logger.warn("Access denied for path: {}, correlationId: {}, error: {}", path, correlationId, accessDeniedException.getMessage());

        // Error response prepare karna
        ErrorResponse errorResponse = new ErrorResponse(
        ) {
            @Override
            public HttpStatusCode getStatusCode() {
                return null;
            }

            @Override
            public ProblemDetail getBody() {
                return null;
            }
        };

        // Response ko set karna
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType("application/json");
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}