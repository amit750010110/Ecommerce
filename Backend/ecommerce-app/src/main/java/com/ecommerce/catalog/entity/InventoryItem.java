package com.ecommerce.catalog.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "inventory_items")
public class InventoryItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer stockQuantity = 0;

    @Column(nullable = false)
    private Integer reservedQuantity = 0;

    @Column(nullable = false)
    private Integer minStockLevel = 0;

    @Column(nullable = false)
    private Integer maxStockLevel = 1000;

    private boolean trackInventory = true;
    private boolean active = true;
    private boolean deleted = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public InventoryItem(Product product, Integer stockQuantity, Integer minStockLevel, Integer maxStockLevel) {
        this.product = product;
        this.stockQuantity = stockQuantity;
        this.minStockLevel = minStockLevel;
        this.maxStockLevel = maxStockLevel;
    }

    public Integer getAvailableQuantity() {
        return stockQuantity - reservedQuantity;
    }

    public boolean isInStock() {
        return getAvailableQuantity() > 0;
    }

    public boolean isLowStock() {
        return stockQuantity <= minStockLevel;
    }
}
