package com.ecommerce.catalog.controller;

import com.ecommerce.catalog.dto.CategoryDto;
import com.ecommerce.catalog.entity.Category;
import com.ecommerce.common.mapper.CategoryMapper;
import com.ecommerce.catalog.service.CategoryService;
import com.ecommerce.auth.dto.ApiResponse;
import com.ecommerce.common.util.LoggingUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/catalog/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

  private final CategoryService categoryService;
  private final CategoryMapper categoryMapper;

  public CategoryController(CategoryService categoryService, CategoryMapper categoryMapper) {
    this.categoryService = categoryService;
    this.categoryMapper = categoryMapper;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<Page<CategoryDto>>> getAllCategories(Pageable pageable) {
    try {
      Page<Category> categories = categoryService.getAllCategories(pageable);
      Page<CategoryDto> categoryDtos = categories.map(categoryMapper::toDto);
      LoggingUtils.logInfo("Retrieved " + categoryDtos.getTotalElements() + " categories");
      return ResponseEntity.ok(new ApiResponse<>("Categories retrieved successfully", categoryDtos));
    } catch (Exception ex) {
      LoggingUtils.logError("Failed to retrieve categories", ex);
      throw ex;
    }
  }

  @GetMapping("/all")
  public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategoriesNoPaging() {
    try {
      List<Category> categories = categoryService.getAllCategoriesNoPaging();
      List<CategoryDto> categoryDtos = categories.stream()
          .map(categoryMapper::toDto)
          .collect(Collectors.toList());
      LoggingUtils.logInfo("Retrieved " + categoryDtos.size() + " categories without paging");
      return ResponseEntity.ok(new ApiResponse<>("Categories retrieved successfully", categoryDtos));
    } catch (Exception ex) {
      LoggingUtils.logError("Failed to retrieve categories", ex);
      throw ex;
    }
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<CategoryDto>> getCategory(@PathVariable Long id) {
    try {
      Category category = categoryService.getCategoryById(id);
      CategoryDto categoryDto = categoryMapper.toDto(category);
      LoggingUtils.logInfo("Retrieved category with id: " + id);
      return ResponseEntity.ok(new ApiResponse<>("Category retrieved successfully", categoryDto));
    } catch (Exception ex) {
      LoggingUtils.logError("Failed to retrieve category with id: " + id, ex);
      throw ex;
    }
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@Valid @RequestBody CategoryDto categoryDto) {
    try {
      Category category = categoryMapper.toEntity(categoryDto);
      Category savedCategory = categoryService.createCategory(category);
      CategoryDto savedCategoryDto = categoryMapper.toDto(savedCategory);
      LoggingUtils.logInfo("Created category with id: " + savedCategory.getId());
      return ResponseEntity.ok(new ApiResponse<>("Category created successfully", savedCategoryDto));
    } catch (Exception ex) {
      LoggingUtils.logError("Failed to create category: " + categoryDto.getName(), ex);
      throw ex;
    }
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
      @PathVariable Long id,
      @Valid @RequestBody CategoryDto categoryDto) {
    try {
      Category category = categoryMapper.toEntity(categoryDto);
      Category updatedCategory = categoryService.updateCategory(id, category);
      CategoryDto updatedCategoryDto = categoryMapper.toDto(updatedCategory);
      LoggingUtils.logInfo("Updated category with id: " + id);
      return ResponseEntity.ok(new ApiResponse<>("Category updated successfully", updatedCategoryDto));
    } catch (Exception ex) {
      LoggingUtils.logError("Failed to update category with id: " + id, ex);
      throw ex;
    }
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
    try {
      categoryService.deleteCategory(id);
      LoggingUtils.logInfo("Deleted category with id: " + id);
      return ResponseEntity.ok(new ApiResponse<>("Category deleted successfully", null));
    } catch (Exception ex) {
      LoggingUtils.logError("Failed to delete category with id: " + id, ex);
      throw ex;
    }
  }

  @GetMapping("/active")
  public ResponseEntity<ApiResponse<List<CategoryDto>>> getActiveCategories() {
    try {
      List<Category> categories = categoryService.getActiveCategories();
      List<CategoryDto> categoryDtos = categories.stream()
          .map(categoryMapper::toDto)
          .collect(Collectors.toList());
      LoggingUtils.logInfo("Retrieved " + categoryDtos.size() + " active categories");
      return ResponseEntity.ok(new ApiResponse<>("Active categories retrieved successfully", categoryDtos));
    } catch (Exception ex) {
      LoggingUtils.logError("Failed to retrieve active categories", ex);
      throw ex;
    }
  }

  @GetMapping("/search")
  public ResponseEntity<ApiResponse<List<CategoryDto>>> searchCategories(@RequestParam String term) {
    try {
      List<Category> categories = categoryService.searchCategories(term);
      List<CategoryDto> categoryDtos = categories.stream()
          .map(categoryMapper::toDto)
          .collect(Collectors.toList());
      LoggingUtils.logInfo("Found " + categoryDtos.size() + " categories matching: " + term);
      return ResponseEntity.ok(new ApiResponse<>("Categories found successfully", categoryDtos));
    } catch (Exception ex) {
      LoggingUtils.logError("Failed to search categories with term: " + term, ex);
      throw ex;
    }
  }
}
