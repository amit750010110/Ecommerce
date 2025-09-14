package com.ecommerce.catalog.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductSearchDto {

  // Search term for product name and description
  private String search;

  // Category filters
  private List<Long> categoryIds;

  // Price range filters
  private BigDecimal minPrice;
  private BigDecimal maxPrice;

  // Rating filter
  private Double minRating;

  // Stock availability filter
  private Boolean inStockOnly;

  // Sorting options
  private String sortBy = "name"; // name, price, createdAt, rating, popularity
  private String sortDir = "asc"; // asc, desc

  // Pagination
  private Integer page = 0;
  private Integer size = 12;

  // Additional filters
  private Boolean activeOnly = true;
  private String brand;
  private List<String> tags;

  // Date range filters
  private String createdAfter;
  private String createdBefore;

  // Convenience methods
  public boolean hasSearchTerm() {
    return search != null && !search.trim().isEmpty();
  }

  public boolean hasCategoryFilter() {
    return categoryIds != null && !categoryIds.isEmpty();
  }

  public boolean hasPriceRange() {
    return minPrice != null || maxPrice != null;
  }

  public boolean hasRatingFilter() {
    return minRating != null && minRating > 0;
  }

  public boolean hasAnyFilters() {
    return hasSearchTerm() || hasCategoryFilter() || hasPriceRange() ||
        hasRatingFilter() || (inStockOnly != null && inStockOnly) ||
        (brand != null && !brand.trim().isEmpty()) ||
        (tags != null && !tags.isEmpty());
  }
}
