package com.ecommerce.cart.repository;

import com.ecommerce.cart.entity.Cart;
import com.ecommerce.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
}
