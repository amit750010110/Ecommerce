package com.ecommerce.catalog.controller;

import com.ecommerce.auth.dto.ApiResponse;
import com.ecommerce.catalog.entity.InventoryItem;
import com.ecommerce.catalog.repository.InventoryRepository;
import com.ecommerce.common.util.LoggingUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog/inventory")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class InventoryController {

  private final InventoryRepository inventoryRepository;

  public InventoryController(InventoryRepository inventoryRepository) {
    this.inventoryRepository = inventoryRepository;
  }

  @GetMapping("/low-stock")
  public ResponseEntity<ApiResponse<List<InventoryItem>>> getLowStockItems() {
    try {
      List<InventoryItem> lowStockItems = inventoryRepository.findLowStockItems();
      LoggingUtils.logInfo("Retrieved " + lowStockItems.size() + " low stock items");
      return ResponseEntity.ok(new ApiResponse<>("Low stock items retrieved successfully", lowStockItems));
    } catch (Exception ex) {
      LoggingUtils.logError("Failed to retrieve low stock items", ex);
      throw ex;
    }
  }

  @GetMapping("/out-of-stock")
  public ResponseEntity<ApiResponse<List<InventoryItem>>> getOutOfStockItems() {
    try {
      List<InventoryItem> outOfStockItems = inventoryRepository.findOutOfStockItems();
      LoggingUtils.logInfo("Retrieved " + outOfStockItems.size() + " out of stock items");
      return ResponseEntity.ok(new ApiResponse<>("Out of stock items retrieved successfully", outOfStockItems));
    } catch (Exception ex) {
      LoggingUtils.logError("Failed to retrieve out of stock items", ex);
      throw ex;
    }
  }

  @GetMapping("/in-stock")
  public ResponseEntity<ApiResponse<List<InventoryItem>>> getInStockItems() {
    try {
      List<InventoryItem> inStockItems = inventoryRepository.findInStockItems();
      LoggingUtils.logInfo("Retrieved " + inStockItems.size() + " in stock items");
      return ResponseEntity.ok(new ApiResponse<>("In stock items retrieved successfully", inStockItems));
    } catch (Exception ex) {
      LoggingUtils.logError("Failed to retrieve in stock items", ex);
      throw ex;
    }
  }

  @PutMapping("/product/{productId}/stock")
  public ResponseEntity<ApiResponse<String>> updateStock(
      @PathVariable Long productId,
      @RequestParam Integer quantity) {
    try {
      int updated = inventoryRepository.updateStockQuantity(productId, quantity);
      if (updated > 0) {
        LoggingUtils.logInfo("Updated stock for product " + productId + " to " + quantity);
        return ResponseEntity.ok(new ApiResponse<>("Stock updated successfully",
            "Product " + productId + " stock updated to " + quantity));
      } else {
        LoggingUtils.logWarning("No inventory item found for product " + productId);
        return ResponseEntity.notFound().build();
      }
    } catch (Exception ex) {
      LoggingUtils.logError("Failed to update stock for product " + productId, ex);
      throw ex;
    }
  }

  @PutMapping("/product/{productId}/reserve")
  public ResponseEntity<ApiResponse<String>> reserveStock(
      @PathVariable Long productId,
      @RequestParam Integer quantity) {
    try {
      int reserved = inventoryRepository.reserveStock(productId, quantity);
      if (reserved > 0) {
        LoggingUtils.logInfo("Reserved " + quantity + " items for product " + productId);
        return ResponseEntity.ok(new ApiResponse<>("Stock reserved successfully",
            "Reserved " + quantity + " items for product " + productId));
      } else {
        LoggingUtils.logWarning("Could not reserve stock for product " + productId +
            " - insufficient quantity or product not found");
        return ResponseEntity.badRequest()
            .body(new ApiResponse<>("Insufficient stock or product not found", null));
      }
    } catch (Exception ex) {
      LoggingUtils.logError("Failed to reserve stock for product " + productId, ex);
      throw ex;
    }
  }

  @PutMapping("/product/{productId}/release")
  public ResponseEntity<ApiResponse<String>> releaseReservedStock(
      @PathVariable Long productId,
      @RequestParam Integer quantity) {
    try {
      int released = inventoryRepository.releaseReservedStock(productId, quantity);
      if (released > 0) {
        LoggingUtils.logInfo("Released " + quantity + " reserved items for product " + productId);
        return ResponseEntity.ok(new ApiResponse<>("Reserved stock released successfully",
            "Released " + quantity + " reserved items for product " + productId));
      } else {
        LoggingUtils.logWarning("Could not release reserved stock for product " + productId +
            " - insufficient reserved quantity or product not found");
        return ResponseEntity.badRequest()
            .body(new ApiResponse<>("Insufficient reserved stock or product not found", null));
      }
    } catch (Exception ex) {
      LoggingUtils.logError("Failed to release reserved stock for product " + productId, ex);
      throw ex;
    }
  }

  @GetMapping("/product/{productId}/available")
  public ResponseEntity<ApiResponse<Integer>> getAvailableQuantity(@PathVariable Long productId) {
    try {
      Integer available = inventoryRepository.getAvailableQuantity(productId);
      LoggingUtils.logInfo("Available quantity for product " + productId + ": " + available);
      return ResponseEntity.ok(new ApiResponse<>("Available quantity retrieved successfully", available));
    } catch (Exception ex) {
      LoggingUtils.logError("Failed to get available quantity for product " + productId, ex);
      throw ex;
    }
  }

  @GetMapping("/stats")
  public ResponseEntity<ApiResponse<InventoryStats>> getInventoryStats() {
    try {
      long inStockCount = inventoryRepository.countInStockProducts();
      long lowStockCount = inventoryRepository.countLowStockProducts();
      long outOfStockCount = inventoryRepository.countOutOfStockProducts();

      InventoryStats stats = new InventoryStats(inStockCount, lowStockCount, outOfStockCount);
      LoggingUtils.logInfo("Retrieved inventory statistics");
      return ResponseEntity.ok(new ApiResponse<>("Inventory statistics retrieved successfully", stats));
    } catch (Exception ex) {
      LoggingUtils.logError("Failed to retrieve inventory statistics", ex);
      throw ex;
    }
  }

  // Inner class for inventory statistics
  public static class InventoryStats {
    private final long inStockProducts;
    private final long lowStockProducts;
    private final long outOfStockProducts;

    public InventoryStats(long inStockProducts, long lowStockProducts, long outOfStockProducts) {
      this.inStockProducts = inStockProducts;
      this.lowStockProducts = lowStockProducts;
      this.outOfStockProducts = outOfStockProducts;
    }

    public long getInStockProducts() {
      return inStockProducts;
    }

    public long getLowStockProducts() {
      return lowStockProducts;
    }

    public long getOutOfStockProducts() {
      return outOfStockProducts;
    }

    public long getTotalProducts() {
      return inStockProducts + lowStockProducts + outOfStockProducts;
    }
  }
}