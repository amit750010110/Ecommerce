package com.ecommerce.catalog.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
  private Long id;
  private String name;
  private String description;
  private BigDecimal price;
  private Long categoryId;
  private String categoryName;
  private List<ProductImageDto> images;
  private Integer stockQuantity;
  private boolean active;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
