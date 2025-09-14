package com.ecommerce.common.mapper;

import com.ecommerce.order.dto.OrderDto;
import com.ecommerce.order.dto.OrderItemDto;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

  public OrderDto toDto(Order order) {
    if (order == null) {
      return null;
    }

    OrderDto orderDto = new OrderDto();
    orderDto.setId(order.getId());
    orderDto.setUserId(order.getUser().getId());
    orderDto.setItems(order.getItems().stream()
        .map(this::toItemDto)
        .collect(Collectors.toList()));
    orderDto.setStatus(order.getStatus().name());
    orderDto.setTotalAmount(order.getTotalAmount());
    orderDto.setShippingAddress(order.getShippingAddress());
    orderDto.setBillingAddress(order.getBillingAddress());
    orderDto.setPaymentMethod(order.getPaymentMethod());
    orderDto.setPaymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null);
    orderDto.setTransactionId(order.getTransactionId());
    orderDto.setTrackingNumber(order.getTrackingNumber());
    orderDto.setCreatedAt(order.getCreatedAt());
    orderDto.setUpdatedAt(order.getUpdatedAt());

    return orderDto;
  }

  public OrderItemDto toItemDto(OrderItem orderItem) {
    if (orderItem == null) {
      return null;
    }

    OrderItemDto itemDto = new OrderItemDto();
    itemDto.setId(orderItem.getId());
    itemDto.setProductId(orderItem.getProduct().getId());
    itemDto.setProductName(orderItem.getProduct().getName());

    // Get the first product image URL if available
    String imageUrl = orderItem.getProduct().getImages().isEmpty() ? null
        : orderItem.getProduct().getImages().get(0).getImageUrl();
    itemDto.setProductImage(imageUrl);

    itemDto.setPrice(orderItem.getPrice());
    itemDto.setQuantity(orderItem.getQuantity());
    itemDto.setTotalPrice(orderItem.getTotalPrice());

    return itemDto;
  }

  public List<OrderDto> toDtoList(List<Order> orders) {
    if (orders == null) {
      return null;
    }

    return orders.stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  public List<OrderItemDto> toItemDtoList(List<OrderItem> orderItems) {
    if (orderItems == null) {
      return null;
    }

    return orderItems.stream()
        .map(this::toItemDto)
        .collect(Collectors.toList());
  }
}