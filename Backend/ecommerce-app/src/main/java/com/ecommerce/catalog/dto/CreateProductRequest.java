package com.ecommerce.catalog.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateProductRequest {
  @NotBlank(message = "Product name is required")
  @Size(min = 2, max = 100, message = "Product name must be between 2 and 100 characters")
  private String name;

  @Size(max = 1000, message = "Description cannot exceed 1000 characters")
  private String description;

  @NotNull(message = "Price is required")
  @DecimalMin(value = "0.01", message = "Price must be greater than 0")
  @Digits(integer = 8, fraction = 2, message = "Price must have at most 8 digits and 2 decimal places")
  private BigDecimal price;

  @NotNull(message = "Category ID is required")
  private Long categoryId;

  @Min(value = 0, message = "Stock quantity cannot be negative")
  private Integer stockQuantity = 0;

  private boolean active = true;
}
