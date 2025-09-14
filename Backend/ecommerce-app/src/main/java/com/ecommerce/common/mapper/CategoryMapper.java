package com.ecommerce.common.mapper;

import com.ecommerce.catalog.dto.CategoryDto;
import com.ecommerce.catalog.entity.Category;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CategoryMapper {

  public CategoryDto toDto(Category category) {
    if (category == null) {
      return null;
    }

    CategoryDto categoryDto = new CategoryDto();
    categoryDto.setId(category.getId());
    categoryDto.setName(category.getName());
    categoryDto.setDescription(category.getDescription());
    categoryDto.setActive(category.isActive());
    categoryDto.setCreatedAt(category.getCreatedAt());
    categoryDto.setUpdatedAt(category.getUpdatedAt());
    categoryDto.setProductCount(category.getProducts() != null ? category.getProducts().size() : 0);

    return categoryDto;
  }

  public Category toEntity(CategoryDto categoryDto) {
    if (categoryDto == null) {
      return null;
    }

    Category category = new Category();
    category.setId(categoryDto.getId());
    category.setName(categoryDto.getName());
    category.setDescription(categoryDto.getDescription());
    category.setActive(categoryDto.isActive());

    return category;
  }

  public List<CategoryDto> toDtoList(List<Category> categories) {
    if (categories == null) {
      return null;
    }

    return categories.stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }
}