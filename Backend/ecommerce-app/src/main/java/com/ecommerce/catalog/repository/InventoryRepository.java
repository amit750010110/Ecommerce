package com.ecommerce.catalog.repository;

import com.ecommerce.catalog.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {

  /**
   * Find inventory item by product ID
   */
  Optional<InventoryItem> findByProductId(Long productId);

  /**
   * Find all inventory items that are active
   */
  List<InventoryItem> findByActiveTrue();

  /**
   * Find all inventory items that are tracking inventory
   */
  List<InventoryItem> findByTrackInventoryTrue();

  /**
   * Find items with low stock (quantity <= minStockLevel)
   */
  @Query("SELECT i FROM InventoryItem i WHERE i.stockQuantity <= i.minStockLevel AND i.active = true AND i.trackInventory = true")
  List<InventoryItem> findLowStockItems();

  /**
   * Find items that are out of stock
   */
  @Query("SELECT i FROM InventoryItem i WHERE i.stockQuantity <= 0 AND i.active = true AND i.trackInventory = true")
  List<InventoryItem> findOutOfStockItems();

  /**
   * Find items that are in stock (available quantity > 0)
   */
  @Query("SELECT i FROM InventoryItem i WHERE (i.stockQuantity - i.reservedQuantity) > 0 AND i.active = true AND i.trackInventory = true")
  List<InventoryItem> findInStockItems();

  /**
   * Find items by stock quantity range
   */
  @Query("SELECT i FROM InventoryItem i WHERE i.stockQuantity BETWEEN :minStock AND :maxStock AND i.active = true")
  List<InventoryItem> findByStockQuantityBetween(@Param("minStock") Integer minStock,
      @Param("maxStock") Integer maxStock);

  /**
   * Update stock quantity for a product
   */
  @Modifying
  @Query("UPDATE InventoryItem i SET i.stockQuantity = :quantity WHERE i.product.id = :productId")
  int updateStockQuantity(@Param("productId") Long productId, @Param("quantity") Integer quantity);

  /**
   * Update reserved quantity for a product
   */
  @Modifying
  @Query("UPDATE InventoryItem i SET i.reservedQuantity = :reservedQuantity WHERE i.product.id = :productId")
  int updateReservedQuantity(@Param("productId") Long productId, @Param("reservedQuantity") Integer reservedQuantity);

  /**
   * Reserve stock for a product (increase reserved quantity)
   */
  @Modifying
  @Query("UPDATE InventoryItem i SET i.reservedQuantity = i.reservedQuantity + :quantity WHERE i.product.id = :productId AND (i.stockQuantity - i.reservedQuantity) >= :quantity")
  int reserveStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);

  /**
   * Release reserved stock for a product (decrease reserved quantity)
   */
  @Modifying
  @Query("UPDATE InventoryItem i SET i.reservedQuantity = i.reservedQuantity - :quantity WHERE i.product.id = :productId AND i.reservedQuantity >= :quantity")
  int releaseReservedStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);

  /**
   * Reduce stock quantity when items are sold
   */
  @Modifying
  @Query("UPDATE InventoryItem i SET i.stockQuantity = i.stockQuantity - :quantity, i.reservedQuantity = i.reservedQuantity - :quantity WHERE i.product.id = :productId AND i.stockQuantity >= :quantity AND i.reservedQuantity >= :quantity")
  int reduceStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);

  /**
   * Check if product has sufficient stock
   */
  @Query("SELECT CASE WHEN (i.stockQuantity - i.reservedQuantity) >= :quantity THEN true ELSE false END FROM InventoryItem i WHERE i.product.id = :productId")
  boolean hasAvailableStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);

  /**
   * Get available quantity for a product
   */
  @Query("SELECT (i.stockQuantity - i.reservedQuantity) FROM InventoryItem i WHERE i.product.id = :productId")
  Integer getAvailableQuantity(@Param("productId") Long productId);

  /**
   * Count total products in stock
   */
  @Query("SELECT COUNT(i) FROM InventoryItem i WHERE (i.stockQuantity - i.reservedQuantity) > 0 AND i.active = true AND i.trackInventory = true")
  long countInStockProducts();

  /**
   * Count products with low stock
   */
  @Query("SELECT COUNT(i) FROM InventoryItem i WHERE i.stockQuantity <= i.minStockLevel AND i.active = true AND i.trackInventory = true")
  long countLowStockProducts();

  /**
   * Count out of stock products
   */
  @Query("SELECT COUNT(i) FROM InventoryItem i WHERE i.stockQuantity <= 0 AND i.active = true AND i.trackInventory = true")
  long countOutOfStockProducts();

  /**
   * Find inventory items by product IDs
   */
  List<InventoryItem> findByProductIdIn(List<Long> productIds);

  /**
   * Find inventory items for products in specific category
   */
  @Query("SELECT i FROM InventoryItem i WHERE i.product.category.id = :categoryId AND i.active = true")
  List<InventoryItem> findByProductCategoryId(@Param("categoryId") Long categoryId);

  /**
   * Delete inventory item by product ID
   */
  void deleteByProductId(Long productId);
}
