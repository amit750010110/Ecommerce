package com.ecommerce.cart.controller;

import com.ecommerce.auth.dto.ApiResponse;
import com.ecommerce.cart.dto.AddToCartRequest;
import com.ecommerce.cart.dto.CartDto;
import com.ecommerce.cart.entity.Cart;
import com.ecommerce.cart.service.CartService;
import com.ecommerce.common.mapper.CartMapper;
import com.ecommerce.common.util.LoggingUtils;
import com.ecommerce.user.entity.User;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class CartController {

  private final CartService cartService;
  private final CartMapper cartMapper;

  public CartController(CartService cartService, CartMapper cartMapper) {
    this.cartService = cartService;
    this.cartMapper = cartMapper;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<CartDto>> getCart(@AuthenticationPrincipal User user) {
    try {
      Cart cart = cartService.getCart(user);
      CartDto cartDto = cartMapper.toDto(cart);
      LoggingUtils.logInfo("Get cart API called successfully for user: " + user.getEmail());
      return ResponseEntity.ok(new ApiResponse<>("Cart retrieved successfully", cartDto));
    } catch (Exception ex) {
      LoggingUtils.logError("Get cart API failed for user: " + user.getEmail(), ex);
      throw ex;
    }
  }

  @PostMapping("/items")
  public ResponseEntity<ApiResponse<CartDto>> addItemToCart(
      @AuthenticationPrincipal User user,
      @Valid @RequestBody AddToCartRequest request) {
    try {
      Cart cart = cartService.addItemToCart(user, request.getProductId(), request.getQuantity());
      CartDto cartDto = cartMapper.toDto(cart);
      LoggingUtils.logInfo("Add item to cart API called successfully for user: " + user.getEmail());
      return ResponseEntity.ok(new ApiResponse<>("Item added to cart successfully", cartDto));
    } catch (Exception ex) {
      LoggingUtils.logError("Add item to cart API failed for user: " + user.getEmail(), ex);
      throw ex;
    }
  }

  @PutMapping("/items/{itemId}")
  public ResponseEntity<ApiResponse<CartDto>> updateCartItemQuantity(
      @AuthenticationPrincipal User user,
      @PathVariable Long itemId,
      @RequestParam int quantity) {
    try {
      Cart cart = cartService.updateCartItemQuantity(user, itemId, quantity);
      CartDto cartDto = cartMapper.toDto(cart);
      LoggingUtils.logInfo("Update cart item quantity API called successfully for user: " + user.getEmail());
      return ResponseEntity.ok(new ApiResponse<>("Cart item quantity updated successfully", cartDto));
    } catch (Exception ex) {
      LoggingUtils.logError("Update cart item quantity API failed for user: " + user.getEmail(), ex);
      throw ex;
    }
  }

  @DeleteMapping("/items/{itemId}")
  public ResponseEntity<ApiResponse<CartDto>> removeItemFromCart(
      @AuthenticationPrincipal User user,
      @PathVariable Long itemId) {
    try {
      Cart cart = cartService.removeItemFromCart(user, itemId);
      CartDto cartDto = cartMapper.toDto(cart);
      LoggingUtils.logInfo("Remove item from cart API called successfully for user: " + user.getEmail());
      return ResponseEntity.ok(new ApiResponse<>("Item removed from cart successfully", cartDto));
    } catch (Exception ex) {
      LoggingUtils.logError("Remove item from cart API failed for user: " + user.getEmail(), ex);
      throw ex;
    }
  }

  @DeleteMapping
  public ResponseEntity<ApiResponse<CartDto>> clearCart(@AuthenticationPrincipal User user) {
    try {
      Cart cart = cartService.clearCart(user);
      CartDto cartDto = cartMapper.toDto(cart);
      LoggingUtils.logInfo("Clear cart API called successfully for user: " + user.getEmail());
      return ResponseEntity.ok(new ApiResponse<>("Cart cleared successfully", cartDto));
    } catch (Exception ex) {
      LoggingUtils.logError("Clear cart API failed for user: " + user.getEmail(), ex);
      throw ex;
    }
  }
}
