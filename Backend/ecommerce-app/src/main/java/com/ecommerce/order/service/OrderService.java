package com.ecommerce.order.service;

import com.ecommerce.cart.entity.Cart;
import com.ecommerce.cart.service.CartService;
import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.util.LoggingUtils;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.OrderItem;
import com.ecommerce.order.entity.OrderStatus;
import com.ecommerce.order.repository.OrderRepository;
import com.ecommerce.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;

    @Autowired
    public OrderService(OrderRepository orderRepository, CartService cartService) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
    }

    @Transactional
    public Order createOrder(User user, String shippingAddress, String billingAddress, String paymentMethod) {
        return createOrder(user, shippingAddress, billingAddress, paymentMethod, null);
    }

    @Transactional
    public Order createOrder(User user, String shippingAddress, String billingAddress, String paymentMethod,
            String transactionId) {
        try {
            // Get user's cart
            Cart cart = cartService.getCart(user);

            if (cart.getItems().isEmpty()) {
                throw new BusinessException("Cannot create order with empty cart");
            }

            // Create new order
            Order order = new Order(user, shippingAddress, billingAddress, paymentMethod);

            // Set transaction ID if provided
            if (transactionId != null && !transactionId.trim().isEmpty()) {
                order.setTransactionId(transactionId);
                order.setPaymentStatus(com.ecommerce.order.entity.PaymentStatus.COMPLETED);
            }

            // Convert cart items to order items
            cart.getItems().forEach(cartItem -> {
                OrderItem orderItem = new OrderItem();
                orderItem.setProduct(cartItem.getProduct());
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setPrice(cartItem.getPrice());
                order.addItem(orderItem);
            });

            // Calculate total amount
            order.setTotalAmount(order.calculateTotal());

            // Save order - explicitly call the inherited save method
            Order savedOrder = this.orderRepository.save(order);

            // Clear cart after successful order
            cartService.clearCart(user);

            LoggingUtils.logInfo("Order created successfully: " + savedOrder.getId() + ", user: " + user.getEmail());
            return savedOrder;
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            LoggingUtils.logError("Error creating order for user: " + user.getEmail(), ex);
            throw new BusinessException("Failed to create order");
        }
    }

    @Transactional(readOnly = true)
    public List<Order> getUserOrders(User user) {
        try {
            List<Order> orders = this.orderRepository.findByUserOrderByCreatedAtDesc(user);

            LoggingUtils.logInfo("Fetched orders for user: " + user.getEmail() + ", count: " + orders.size());
            return orders;
        } catch (Exception ex) {
            LoggingUtils.logError("Error fetching orders for user: " + user.getEmail(), ex);
            throw new BusinessException("Failed to fetch orders");
        }
    }

    @Transactional(readOnly = true)
    public Order getOrderById(Long id, User user) {
        try {
            return this.orderRepository.findByIdAndUser(id, user)
                    .orElseThrow(() -> new BusinessException("Order not found: " + id));
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            LoggingUtils.logError("Error fetching order: " + id + ", user: " + user.getEmail(), ex);
            throw new BusinessException("Failed to fetch order");
        }
    }

    @Transactional
    public Order cancelOrder(Long id, User user) {
        try {
            Order order = getOrderById(id, user);

            if (!order.getStatus().equals(com.ecommerce.order.entity.OrderStatus.PENDING)) {
                throw new BusinessException("Cannot cancel order in status: " + order.getStatus());
            }

            order.setStatus(com.ecommerce.order.entity.OrderStatus.CANCELLED);
            Order savedOrder = this.orderRepository.save(order);

            LoggingUtils.logInfo("Order cancelled: " + id + ", user: " + user.getEmail());
            return savedOrder;
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            LoggingUtils.logError("Error cancelling order: " + id + ", user: " + user.getEmail(), ex);
            throw new BusinessException("Failed to cancel order");
        }
    }

    // Admin methods
    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        try {
            List<Order> orders = this.orderRepository.findAll();
            LoggingUtils.logInfo("Fetched all orders, count: " + orders.size());
            return orders;
        } catch (Exception ex) {
            LoggingUtils.logError("Error fetching all orders", ex);
            throw new BusinessException("Failed to fetch orders");
        }
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        try {
            Order order = this.orderRepository.findById(orderId)
                    .orElseThrow(() -> new BusinessException("Order not found: " + orderId));

            order.setStatus(newStatus);
            Order savedOrder = this.orderRepository.save(order);

            LoggingUtils.logInfo("Order status updated: " + orderId + ", new status: " + newStatus);
            return savedOrder;
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            LoggingUtils.logError("Error updating order status: " + orderId, ex);
            throw new BusinessException("Failed to update order status");
        }
    }

    @Transactional
    public Order updateTrackingNumber(Long orderId, String trackingNumber) {
        try {
            Order order = this.orderRepository.findById(orderId)
                    .orElseThrow(() -> new BusinessException("Order not found: " + orderId));

            order.setTrackingNumber(trackingNumber);
            Order savedOrder = this.orderRepository.save(order);

            LoggingUtils.logInfo("Order tracking number updated: " + orderId + ", tracking: " + trackingNumber);
            return savedOrder;
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            LoggingUtils.logError("Error updating order tracking number: " + orderId, ex);
            throw new BusinessException("Failed to update tracking number");
        }
    }
}