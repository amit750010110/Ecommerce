package com.ecommerce.catalog.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageDto {
  private Long id;
  private String imageUrl;
  private String altText;
  private Integer displayOrder;
  private boolean active;
}