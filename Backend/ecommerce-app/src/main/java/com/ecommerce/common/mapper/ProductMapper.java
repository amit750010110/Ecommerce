package com.ecommerce.common.mapper;

import com.ecommerce.catalog.dto.ProductDto;
import com.ecommerce.catalog.dto.ProductImageDto;
import com.ecommerce.catalog.entity.Product;
import com.ecommerce.catalog.entity.ProductImage;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

  public ProductDto toDto(Product product) {
    if (product == null) {
      return null;
    }

    ProductDto productDto = new ProductDto();
    productDto.setId(product.getId());
    productDto.setName(product.getName());
    productDto.setDescription(product.getDescription());
    productDto.setPrice(product.getPrice());
    productDto.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
    productDto.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : null);
    productDto.setImages(product.getImages().stream()
        .map(this::toImageDto)
        .collect(Collectors.toList()));
    productDto.setStockQuantity(product.getInventoryItem() != null ? product.getInventoryItem().getStockQuantity() : 0);
    productDto.setActive(product.isActive());
    productDto.setCreatedAt(product.getCreatedAt());
    productDto.setUpdatedAt(product.getUpdatedAt());

    return productDto;
  }

  public ProductImageDto toImageDto(ProductImage productImage) {
    if (productImage == null) {
      return null;
    }

    ProductImageDto imageDto = new ProductImageDto();
    imageDto.setId(productImage.getId());
    imageDto.setImageUrl(productImage.getImageUrl());
    imageDto.setAltText(productImage.getAltText());
    imageDto.setDisplayOrder(productImage.getDisplayOrder());
    imageDto.setActive(productImage.isActive());

    return imageDto;
  }

  public List<ProductDto> toDtoList(List<Product> products) {
    if (products == null) {
      return null;
    }

    return products.stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  public List<ProductImageDto> toImageDtoList(List<ProductImage> productImages) {
    if (productImages == null) {
      return null;
    }

    return productImages.stream()
        .map(this::toImageDto)
        .collect(Collectors.toList());
  }
}
