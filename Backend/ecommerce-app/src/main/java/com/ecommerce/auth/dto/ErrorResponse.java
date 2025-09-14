package com.ecommerce.auth.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ErrorResponse {

    private LocalDateTime timestamp;
    private String correlationId;
    private String path;
    private String error;
    private String message;
    private List<FieldError> fieldErrors;

    public ErrorResponse(LocalDateTime timestamp, String correlationId, String path,
                         String error, String message, List<FieldError> fieldErrors) {
        this.timestamp = timestamp;
        this.correlationId = correlationId;
        this.path = path;
        this.error = error;
        this.message = message;
        this.fieldErrors = fieldErrors;
    }

    @Data
    public static class FieldError {
        private String field;
        private String message;

        public FieldError(String field, String message) {
            this.field = field;
            this.message = message;
        }
    }
}
