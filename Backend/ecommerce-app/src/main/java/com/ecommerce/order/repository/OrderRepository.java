package com.ecommerce.order.repository;

import com.ecommerce.order.entity.Order;
import com.ecommerce.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o WHERE o.user = :user ORDER BY o.createdAt DESC")
    List<Order> findByUserOrderByCreatedAtDesc(@Param("user") User user);

    @Query("SELECT o FROM Order o WHERE o.id = :id AND o.user = :user")
    Optional<Order> findByIdAndUser(@Param("id") Long id, @Param("user") User user);
}
