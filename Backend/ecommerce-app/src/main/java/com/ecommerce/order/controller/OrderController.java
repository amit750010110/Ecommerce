package com.ecommerce.order.controller;

import com.ecommerce.auth.dto.ApiResponse;
import com.ecommerce.common.mapper.OrderMapper;
import com.ecommerce.common.util.LoggingUtils;
import com.ecommerce.order.dto.CreateOrderRequest;
import com.ecommerce.order.dto.OrderDto;
import com.ecommerce.order.dto.UpdateOrderStatusRequest;
import com.ecommerce.order.dto.UpdateTrackingNumberRequest;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.OrderStatus;
import com.ecommerce.order.service.OrderService;
import com.ecommerce.user.entity.User;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class OrderController {

  private final OrderService orderService;
  private final OrderMapper orderMapper;

  public OrderController(OrderService orderService, OrderMapper orderMapper) {
    this.orderService = orderService;
    this.orderMapper = orderMapper;
  }

  @PostMapping
  public ResponseEntity<ApiResponse<OrderDto>> createOrder(
      @AuthenticationPrincipal User user,
      @Valid @RequestBody CreateOrderRequest request) {
    try {
      Order order = orderService.createOrder(
          user,
          request.getShippingAddress(),
          request.getBillingAddress(),
          request.getPaymentMethod(),
          request.getTransactionId());

      OrderDto orderDto = orderMapper.toDto(order);
      LoggingUtils.logInfo("Create order API called successfully for user: " + user.getEmail());
      return ResponseEntity.ok(new ApiResponse<>("Order created successfully", orderDto));
    } catch (Exception ex) {
      LoggingUtils.logError("Create order API failed for user: " + user.getEmail(), ex);
      throw ex;
    }
  }

  @GetMapping
  public ResponseEntity<ApiResponse<List<OrderDto>>> getUserOrders(@AuthenticationPrincipal User user) {
    try {
      List<Order> orders = orderService.getUserOrders(user);
      List<OrderDto> orderDtos = orderMapper.toDtoList(orders);
      LoggingUtils.logInfo("Get user orders API called successfully for user: " + user.getEmail());
      return ResponseEntity.ok(new ApiResponse<>("Orders retrieved successfully", orderDtos));
    } catch (Exception ex) {
      LoggingUtils.logError("Get user orders API failed for user: " + user.getEmail(), ex);
      throw ex;
    }
  }

  @GetMapping("/{orderId}")
  public ResponseEntity<ApiResponse<OrderDto>> getOrderById(
      @AuthenticationPrincipal User user,
      @PathVariable Long orderId) {
    try {
      Order order = orderService.getOrderById(orderId, user);
      OrderDto orderDto = orderMapper.toDto(order);
      LoggingUtils.logInfo("Get order by ID API called successfully for user: " + user.getEmail());
      return ResponseEntity.ok(new ApiResponse<>("Order retrieved successfully", orderDto));
    } catch (Exception ex) {
      LoggingUtils.logError("Get order by ID API failed for user: " + user.getEmail(), ex);
      throw ex;
    }
  }

  @PatchMapping("/{orderId}/cancel")
  public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(
      @AuthenticationPrincipal User user,
      @PathVariable Long orderId) {
    try {
      Order order = orderService.cancelOrder(orderId, user);
      OrderDto orderDto = orderMapper.toDto(order);
      LoggingUtils.logInfo("Cancel order API called successfully for user: " + user.getEmail());
      return ResponseEntity.ok(new ApiResponse<>("Order cancelled successfully", orderDto));
    } catch (Exception ex) {
      LoggingUtils.logError("Cancel order API failed for user: " + user.getEmail(), ex);
      throw ex;
    }
  }

  // Admin endpoints
  @GetMapping("/admin/all")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<List<OrderDto>>> getAllOrders() {
    try {
      List<Order> orders = orderService.getAllOrders();
      List<OrderDto> orderDtos = orderMapper.toDtoList(orders);
      LoggingUtils.logInfo("Get all orders API called successfully by admin");
      return ResponseEntity.ok(new ApiResponse<>("All orders retrieved successfully", orderDtos));
    } catch (Exception ex) {
      LoggingUtils.logError("Get all orders API failed", ex);
      throw ex;
    }
  }

  @PatchMapping("/admin/{orderId}/status")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
      @PathVariable Long orderId,
      @Valid @RequestBody UpdateOrderStatusRequest request) {
    try {
      OrderStatus status = OrderStatus.valueOf(request.getStatus().toUpperCase());
      Order order = orderService.updateOrderStatus(orderId, status);
      OrderDto orderDto = orderMapper.toDto(order);
      LoggingUtils.logInfo("Update order status API called successfully by admin");
      return ResponseEntity.ok(new ApiResponse<>("Order status updated successfully", orderDto));
    } catch (IllegalArgumentException ex) {
      LoggingUtils.logError("Invalid order status: " + request.getStatus(), ex);
      throw new RuntimeException("Invalid order status: " + request.getStatus());
    } catch (Exception ex) {
      LoggingUtils.logError("Update order status API failed", ex);
      throw ex;
    }
  }

  @PatchMapping("/admin/{orderId}/tracking")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<OrderDto>> updateTrackingNumber(
      @PathVariable Long orderId,
      @Valid @RequestBody UpdateTrackingNumberRequest request) {
    try {
      Order order = orderService.updateTrackingNumber(orderId, request.getTrackingNumber());
      OrderDto orderDto = orderMapper.toDto(order);
      LoggingUtils.logInfo("Update tracking number API called successfully by admin");
      return ResponseEntity.ok(new ApiResponse<>("Tracking number updated successfully", orderDto));
    } catch (Exception ex) {
      LoggingUtils.logError("Update tracking number API failed", ex);
      throw ex;
    }
  }
}
