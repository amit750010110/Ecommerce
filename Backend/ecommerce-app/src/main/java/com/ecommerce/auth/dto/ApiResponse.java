package com.ecommerce.auth.dto;

import lombok.Data;

@Data
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;

    public ApiResponse(String message, T data) {
        this.success = true;
        this.message = message;
        this.data = data;
    }
}