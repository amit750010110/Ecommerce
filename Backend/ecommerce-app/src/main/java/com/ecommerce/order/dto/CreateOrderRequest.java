package com.ecommerce.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
  @NotBlank(message = "Shipping address is required")
  private String shippingAddress;

  @NotBlank(message = "Billing address is required")
  private String billingAddress;

  @NotBlank(message = "Payment method is required")
  private String paymentMethod;

  private String transactionId;
}
