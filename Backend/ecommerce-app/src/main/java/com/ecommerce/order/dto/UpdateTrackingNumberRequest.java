package com.ecommerce.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTrackingNumberRequest {
  @NotBlank(message = "Tracking number is required")
  private String trackingNumber;
}