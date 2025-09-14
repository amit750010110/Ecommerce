package com.ecommerce.catalog.repository;

import com.ecommerce.catalog.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

  /**
   * Find active categories
   */
  List<Category> findByActiveTrue();

  /**
   * Check if category exists by name
   */
  boolean existsByName(String name);

  /**
   * Check if category exists by name (case insensitive)
   */
  boolean existsByNameIgnoreCase(String name);

  /**
   * Find category by name
   */
  Optional<Category> findByName(String name);

  /**
   * Find category by name (case insensitive)
   */
  Optional<Category> findByNameIgnoreCase(String name);

  /**
   * Find categories by name containing (search)
   */
  List<Category> findByNameContainingIgnoreCase(String name);

  /**
   * Find categories ordered by name
   */
  List<Category> findAllByOrderByNameAsc();

  /**
   * Find active categories ordered by name
   */
  List<Category> findByActiveTrueOrderByNameAsc();

  /**
   * Count products in a category
   */
  @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId")
  long countProductsInCategory(@Param("categoryId") Long categoryId);
}
