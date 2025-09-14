package com.ecommerce.catalog.controller;

import com.ecommerce.auth.dto.ApiResponse;
import com.ecommerce.catalog.dto.CreateProductRequest;
import com.ecommerce.catalog.dto.ProductDto;
import com.ecommerce.catalog.dto.ProductSearchDto;
import com.ecommerce.catalog.dto.UpdateProductRequest;
import com.ecommerce.catalog.entity.Product;
import com.ecommerce.catalog.service.ProductService;
import com.ecommerce.common.mapper.ProductMapper;
import com.ecommerce.common.util.LoggingUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/catalog/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {
    private final ProductService productService;
    private final ProductMapper productMapper;

    ProductController(ProductService productService, ProductMapper productMapper) {
        this.productService = productService;
        this.productMapper = productMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductDto>>> searchProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) List<Long> categoryIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        try {
            // Create pageable object
            Sort sort = sortDir.equalsIgnoreCase("desc")
                    ? Sort.by(sortBy).descending()
                    : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);

            // Search products
            Page<Product> productPage = productService.searchProducts(search, minPrice, maxPrice, categoryIds,
                    pageable);

            // Convert to DTOs
            Page<ProductDto> productDtoPage = productPage.map(productMapper::toDto);

            LoggingUtils.logInfo("Product search API called successfully");
            return ResponseEntity.ok(new ApiResponse<>("Products fetched successfully", productDtoPage));
        } catch (Exception ex) {
            LoggingUtils.logError("Product search API failed", ex);
            throw ex;
        }
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<Page<ProductDto>>> advancedSearch(
            @Valid @RequestBody ProductSearchDto searchDto) {
        try {
            // Create pageable object
            Sort sort = searchDto.getSortDir().equalsIgnoreCase("desc")
                    ? Sort.by(searchDto.getSortBy()).descending()
                    : Sort.by(searchDto.getSortBy()).ascending();
            Pageable pageable = PageRequest.of(searchDto.getPage(), searchDto.getSize(), sort);

            // Advanced search with all filters
            Page<Product> productPage = productService.advancedSearchProducts(searchDto, pageable);

            // Convert to DTOs
            Page<ProductDto> productDtoPage = productPage.map(productMapper::toDto);

            LoggingUtils.logInfo("Advanced product search completed: " +
                    searchDto.hasAnyFilters() + " filters applied, " +
                    productDtoPage.getTotalElements() + " products found");

            return ResponseEntity.ok(new ApiResponse<>("Products found successfully", productDtoPage));
        } catch (Exception ex) {
            LoggingUtils.logError("Advanced product search failed", ex);
            throw ex;
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProduct(@PathVariable Long id) {
        try {
            Product product = productService.getProductById(id);
            ProductDto productDto = productMapper.toDto(product);

            LoggingUtils.logInfo("Product fetch API called successfully for id: " + id);
            return ResponseEntity.ok(new ApiResponse<>("Product fetched successfully ", productDto));
        } catch (Exception ex) {
            LoggingUtils.logError("Product fetch API failed for id: " + id, ex);
            throw ex;
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(
            @Valid @RequestBody CreateProductRequest request) {
        try {
            Product product = productService.createProduct(request);
            ProductDto productDto = productMapper.toDto(product);
            LoggingUtils.logInfo("Product created successfully with id: " + product.getId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>("Product created successfully", productDto));
        } catch (Exception ex) {
            LoggingUtils.logError("Product creation failed", ex);
            throw ex;
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {
        try {
            Product product = productService.updateProduct(id, request);
            ProductDto productDto = productMapper.toDto(product);
            LoggingUtils.logInfo("Product updated successfully with id: " + id);
            return ResponseEntity.ok(new ApiResponse<>("Product updated successfully", productDto));
        } catch (Exception ex) {
            LoggingUtils.logError("Product update failed for id: " + id, ex);
            throw ex;
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            LoggingUtils.logInfo("Product deleted successfully with id: " + id);
            return ResponseEntity.ok(new ApiResponse<>("Product deleted successfully", null));
        } catch (Exception ex) {
            LoggingUtils.logError("Product deletion failed for id: " + id, ex);
            throw ex;
        }
    }

    @PostMapping("/{id}/images")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductDto>> uploadProductImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "altText", required = false) String altText) {
        try {
            Product product = productService.addProductImage(id, file, altText);
            ProductDto productDto = productMapper.toDto(product);
            LoggingUtils.logInfo("Image uploaded successfully for product id: " + id);
            return ResponseEntity.ok(new ApiResponse<>("Image uploaded successfully", productDto));
        } catch (Exception ex) {
            LoggingUtils.logError("Image upload failed for product id: " + id, ex);
            throw ex;
        }
    }

    @DeleteMapping("/{productId}/images/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProductImage(
            @PathVariable Long productId,
            @PathVariable Long imageId) {
        try {
            productService.deleteProductImage(productId, imageId);
            LoggingUtils.logInfo("Image deleted successfully for product id: " + productId);
            return ResponseEntity.ok(new ApiResponse<>("Image deleted successfully", null));
        } catch (Exception ex) {
            LoggingUtils.logError("Image deletion failed for product id: " + productId, ex);
            throw ex;
        }
    }
}
