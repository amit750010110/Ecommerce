package com.ecommerce.order.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
  private Long id;
  private Long userId;
  private List<OrderItemDto> items;
  private String status;
  private BigDecimal totalAmount;
  private String shippingAddress;
  private String billingAddress;
  private String paymentMethod;
  private String paymentStatus;
  private String transactionId;
  private String trackingNumber;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
