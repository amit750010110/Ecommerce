package com.ecommerce.catalog.service;

import com.ecommerce.catalog.entity.Category;
import com.ecommerce.catalog.repository.CategoryRepository;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.common.util.LoggingUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class CategoryService {

  private final CategoryRepository categoryRepository;

  public CategoryService(CategoryRepository categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  public Page<Category> getAllCategories(Pageable pageable) {
    LoggingUtils.logInfo("Retrieving all categories with pagination");
    return categoryRepository.findAll(pageable);
  }

  public List<Category> getAllCategoriesNoPaging() {
    LoggingUtils.logInfo("Retrieving all categories without pagination");
    return categoryRepository.findAll();
  }

  public Category getCategoryById(Long id) {
    LoggingUtils.logInfo("Retrieving category with id: " + id);
    return categoryRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
  }

  public Category createCategory(Category category) {
    LoggingUtils.logInfo("Creating new category: " + category.getName());

    // Check if category name already exists
    if (categoryRepository.existsByName(category.getName())) {
      throw new IllegalArgumentException("Category with name '" + category.getName() + "' already exists");
    }

    // Set creation timestamp
    category.setCreatedAt(LocalDateTime.now());
    category.setUpdatedAt(LocalDateTime.now());

    Category savedCategory = categoryRepository.save(category);
    LoggingUtils.logInfo("Category created successfully with id: " + savedCategory.getId());
    return savedCategory;
  }

  public Category updateCategory(Long id, Category categoryDetails) {
    LoggingUtils.logInfo("Updating category with id: " + id);

    Category existingCategory = getCategoryById(id);

    // Check if new name conflicts with existing category (excluding current one)
    if (!existingCategory.getName().equals(categoryDetails.getName()) &&
        categoryRepository.existsByName(categoryDetails.getName())) {
      throw new IllegalArgumentException("Category with name '" + categoryDetails.getName() + "' already exists");
    }

    // Update fields
    existingCategory.setName(categoryDetails.getName());
    existingCategory.setDescription(categoryDetails.getDescription());
    existingCategory.setActive(categoryDetails.isActive());
    existingCategory.setUpdatedAt(LocalDateTime.now());

    Category updatedCategory = categoryRepository.save(existingCategory);
    LoggingUtils.logInfo("Category updated successfully with id: " + id);
    return updatedCategory;
  }

  public void deleteCategory(Long id) {
    LoggingUtils.logInfo("Deleting category with id: " + id);

    Category category = getCategoryById(id);

    // Check if category has products
    if (category.getProducts() != null && !category.getProducts().isEmpty()) {
      throw new IllegalStateException(
          "Cannot delete category with products. Please remove or reassign products first.");
    }

    categoryRepository.delete(category);
    LoggingUtils.logInfo("Category deleted successfully with id: " + id);
  }

  public List<Category> getActiveCategories() {
    LoggingUtils.logInfo("Retrieving active categories");
    return categoryRepository.findByActiveTrue();
  }

  public List<Category> searchCategories(String searchTerm) {
    LoggingUtils.logInfo("Searching categories with term: " + searchTerm);
    return categoryRepository.findByNameContainingIgnoreCase(searchTerm);
  }

  @Transactional(readOnly = true)
  public boolean categoryExists(Long id) {
    return categoryRepository.existsById(id);
  }

  @Transactional(readOnly = true)
  public boolean categoryExistsByName(String name) {
    return categoryRepository.existsByName(name);
  }

  public long getProductCountForCategory(Long categoryId) {
    LoggingUtils.logInfo("Getting product count for category id: " + categoryId);
    Category category = getCategoryById(categoryId);
    return category.getProducts() != null ? category.getProducts().size() : 0;
  }
}
