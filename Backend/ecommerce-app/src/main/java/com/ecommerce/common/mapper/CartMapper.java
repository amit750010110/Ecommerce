package com.ecommerce.common.mapper;

import com.ecommerce.cart.dto.CartDto;
import com.ecommerce.cart.dto.CartItemDto;
import com.ecommerce.cart.entity.Cart;
import com.ecommerce.cart.entity.CartItem;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CartMapper {

  public CartDto toDto(Cart cart) {
    if (cart == null) {
      return null;
    }

    CartDto cartDto = new CartDto();
    cartDto.setId(cart.getId());
    cartDto.setUserId(cart.getUser().getId());
    cartDto.setItems(cart.getItems().stream()
        .map(this::toItemDto)
        .collect(Collectors.toList()));
    cartDto.setTotalPrice(cart.getTotalPrice());
    cartDto.setTotalItems(cart.getTotalItems());
    cartDto.setCreatedAt(cart.getCreatedAt());
    cartDto.setUpdatedAt(cart.getUpdatedAt());

    return cartDto;
  }

  public CartItemDto toItemDto(CartItem cartItem) {
    if (cartItem == null) {
      return null;
    }

    CartItemDto itemDto = new CartItemDto();
    itemDto.setId(cartItem.getId());
    itemDto.setProductId(cartItem.getProduct().getId());
    itemDto.setProductName(cartItem.getProduct().getName());

    // Get the first product image URL if available
    String imageUrl = cartItem.getProduct().getImages().isEmpty() ? null
        : cartItem.getProduct().getImages().get(0).getImageUrl();
    itemDto.setProductImage(imageUrl);

    itemDto.setPrice(cartItem.getPrice());
    itemDto.setQuantity(cartItem.getQuantity());
    itemDto.setTotalPrice(cartItem.getTotalPrice());

    return itemDto;
  }

  public List<CartDto> toDtoList(List<Cart> carts) {
    return carts.stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  public List<CartItemDto> toItemDtoList(List<CartItem> cartItems) {
    return cartItems.stream()
        .map(this::toItemDto)
        .collect(Collectors.toList());
  }
}