package com.ecommerce.user.repository;


import com.ecommerce.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Modifying
    @Query("UPDATE User u SET u.failedLoginAttempts = :attempts, u.lockTime = :lockTime WHERE u.email = :email")
    void updateFailedLoginAttempts(@Param("email") String email,
                                   @Param("attempts") int attempts,
                                   @Param("lockTime") LocalDateTime lockTime);

    @Modifying
    @Query("UPDATE User u SET u.failedLoginAttempts = 0, u.lockTime = null WHERE u.email = :email")
    void resetFailedLoginAttempts(@Param("email") String email);
}