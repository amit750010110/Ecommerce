package com.ecommerce.user.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressDto {
  private Long id;

  @NotBlank(message = "First name is required")
  private String firstName;

  @NotBlank(message = "Last name is required")
  private String lastName;

  @NotBlank(message = "Street address is required")
  private String street;

  @NotBlank(message = "City is required")
  private String city;

  @NotBlank(message = "State is required")
  private String state;

  @NotBlank(message = "ZIP code is required")
  private String zipCode;

  @NotBlank(message = "Country is required")
  private String country;

  private boolean isDefault;

  @NotNull(message = "User ID is required")
  private Long userId;
}
