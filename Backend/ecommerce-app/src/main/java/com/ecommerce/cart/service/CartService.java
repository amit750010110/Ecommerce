package com.ecommerce.cart.service;

import com.ecommerce.cart.entity.Cart;
import com.ecommerce.cart.entity.CartItem;
import com.ecommerce.cart.repository.CartRepository;
import com.ecommerce.catalog.entity.Product;
import com.ecommerce.catalog.service.ProductService;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.common.util.LoggingUtils;
import com.ecommerce.user.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CartService {
    private final CartRepository cartRepository;
    private final ProductService productService;

    public CartService(CartRepository cartRepository, ProductService productService) {
        this.cartRepository = cartRepository;
        this.productService = productService;
    }

    @Transactional
    public Cart getOrCreateCart(User user) {
        try {
            return cartRepository.findByUser(user)
                    .orElseGet(() -> {
                        Cart newCart = new Cart(user);
                        return cartRepository.save(newCart);
                    });
        } catch (Exception ex) {
            LoggingUtils.logError("Error getting or creating cart for user: " + user.getEmail(), ex);
            throw ex;
        }
    }

    @Transactional
    public Cart addItemToCart(User user, Long productId, int quantity) {
        try {
            Cart cart = getOrCreateCart(user);
            Product product = productService.getProductById(productId);
            // Check if item is already exist in cart
            Optional<CartItem> existingItem = cart.getItems().stream()
                    .filter(item -> item.getProduct().getId().equals(productId))
                    .findFirst();

            if (existingItem.isPresent()) {
                // Update Quantity of existing item
                CartItem item = existingItem.get();
                item.incrementQuantity(quantity);
            } else {
                // Add new item to cart
                CartItem newItem = new CartItem(product, quantity);
                cart.addItem(newItem);
            }

            Cart savedCart = cartRepository.save(cart);
            LoggingUtils.logInfo("Added product to cart: " + productId + ", user: " + user.getEmail());
            return savedCart;
        } catch (Exception ex) {
            LoggingUtils.logError("Error adding item to cart: " + productId + ", user: " + user.getEmail(), ex);
            throw ex;
        }
    }

    // Update Cart Item Quantity
    @Transactional
    public Cart updateCartItemQuantity(User user, Long itemId, int quantity) {
        try {
            Cart cart = getOrCreateCart(user);

            CartItem cartItem = cart.getItems().stream()
                    .filter(item -> item.getId().equals(itemId))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + itemId));

            if (quantity <= 0) {
                cart.removeItem(cartItem);
            } else {
                cartItem.setQuantity(quantity);
            }

            Cart savedCart = cartRepository.save(cart);
            LoggingUtils.logInfo("Updated cart item quantity: " + itemId + ", user: " + user.getEmail());
            return savedCart;
        } catch (Exception ex) {
            LoggingUtils.logError("Error updating cart item quantity: " + itemId + ", user: " + user.getEmail(), ex);
            throw ex;
        }
    }

    @Transactional
    public Cart removeItemFromCart(User user, Long itemId) {
        try {
            Cart cart = getOrCreateCart(user);
            CartItem cartItem = cart.getItems().stream()
                    .filter(item -> item.getId().equals(itemId))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + itemId));

            cart.removeItem(cartItem);
            Cart savedCart = cartRepository.save(cart);

            LoggingUtils.logInfo("Removed item from cart: " + itemId + ", user: " + user.getEmail());
            return savedCart;
        } catch (Exception ex) {
            LoggingUtils.logError("Error removing item from cart: " + itemId + ", user: " + user.getEmail(), ex);
            throw ex;
        }
    }

    @Transactional
    public Cart clearCart(User user) {
        try {
            Cart cart = getOrCreateCart(user);
            cart.clear();

            Cart savedCart = cartRepository.save(cart);
            LoggingUtils.logInfo("Cleared cart for user: " + user.getEmail());
            return savedCart;
        } catch (Exception ex) {
            LoggingUtils.logError("Error clearing cart for user: " + user.getEmail(), ex);
            throw ex;
        }
    }

    @Transactional
    public Cart getCart(User user) {
        try {
            return getOrCreateCart(user);
        } catch (Exception ex) {
            LoggingUtils.logError("Error getting cart for user: " + user.getEmail(), ex);
            throw ex;
        }
    }
}