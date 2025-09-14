package com.ecommerce.cart.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartDto {
  private Long id;
  private Long userId;
  private List<CartItemDto> items;
  private BigDecimal totalPrice;
  private int totalItems;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
