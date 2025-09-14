package com.ecommerce.catalog.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
  private Long id;
  private String name;
  private String description;
  private boolean active;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private Integer productCount;
}
