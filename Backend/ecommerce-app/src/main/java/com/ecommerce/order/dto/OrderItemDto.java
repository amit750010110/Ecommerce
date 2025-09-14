package com.ecommerce.order.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDto {
  private Long id;
  private Long productId;
  private String productName;
  private String productImage;
  private BigDecimal price;
  private int quantity;
  private BigDecimal totalPrice;
}
