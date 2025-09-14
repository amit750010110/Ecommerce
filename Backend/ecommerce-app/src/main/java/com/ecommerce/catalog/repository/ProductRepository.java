package com.ecommerce.catalog.repository;

import com.ecommerce.catalog.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByActiveTrueAndDeletedFalse(Pageable pageable);

    Page<Product> findByCategoryIdAndActiveTrueAndDeletedFalse(Long categoryId, Pageable pageable);

    Page<Product> findByCategoryIdInAndActiveTrueAndDeletedFalse(List<Long> categoryIds, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
            "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
            "(:categoryIds IS NULL OR p.category.id IN :categoryIds) AND " +
            "p.active = true AND p.deleted = false")
    Page<Product> searchProducts(
            @Param("search") String search,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("categoryIds") List<Long> categoryIds,
            Pageable pageable
    );

    @Query("SELECT p FROM Product p WHERE p.id IN :productIds AND p.active = true AND p.deleted = false")
    List<Product> findByIdIn(List<Long> productIds);

}
