package com.ecommerce.catalog.service;

import com.ecommerce.catalog.dto.CreateProductRequest;
import com.ecommerce.catalog.dto.ProductSearchDto;
import com.ecommerce.catalog.dto.UpdateProductRequest;
import com.ecommerce.catalog.entity.Category;
import com.ecommerce.catalog.entity.InventoryItem;
import com.ecommerce.catalog.entity.Product;
import com.ecommerce.catalog.entity.ProductImage;
import com.ecommerce.catalog.repository.CategoryRepository;
import com.ecommerce.catalog.repository.InventoryRepository;
import com.ecommerce.catalog.repository.ProductRepository;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.common.util.LoggingUtils;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${app.file.base-url:http://localhost:8080}")
    private String baseUrl;

    public ProductService(ProductRepository productRepository,
            CategoryRepository categoryRepository,
            InventoryRepository inventoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional
    public Page<Product> searchProducts(String search, BigDecimal minPrice, BigDecimal maxPrice, List<Long> categoryId,
            Pageable pageable) {
        try {
            Page<Product> products = productRepository.searchProducts(search, minPrice, maxPrice, categoryId, pageable);
            LoggingUtils.logInfo("Product search completed: " + search +
                    ", result: " + products.getTotalElements() + " items found.");

            return products;
        } catch (Exception ex) {
            LoggingUtils.logError("Error during product search: " + search, ex);
            throw ex;
        }

    }

    @Transactional
    public Page<Product> advancedSearchProducts(ProductSearchDto searchDto, Pageable pageable) {
        try {
            // Use the existing search method but with advanced filters
            Page<Product> products = productRepository.searchProducts(
                    searchDto.getSearch(),
                    searchDto.getMinPrice(),
                    searchDto.getMaxPrice(),
                    searchDto.getCategoryIds(),
                    pageable);

            // Additional filtering for stock availability if needed
            if (searchDto.getInStockOnly() != null && searchDto.getInStockOnly()) {
                // Note: This would require additional repository method or criteria query
                // For now, we'll use the existing search method
                LoggingUtils.logInfo("In-stock filtering requested but not implemented in repository level");
            }

            LoggingUtils.logInfo("Advanced product search completed with " +
                    (searchDto.hasAnyFilters() ? "multiple" : "no") + " filters applied. " +
                    "Found " + products.getTotalElements() + " products.");

            return products;
        } catch (Exception ex) {
            LoggingUtils.logError("Error during advanced product search", ex);
            throw ex;
        }
    }

    @Transactional
    public Page<Product> getProductsByCategory(Long categoryId, Pageable pageable) {
        try {
            Page<Product> products = productRepository.findByCategoryIdAndActiveTrueAndDeletedFalse(categoryId,
                    pageable);
            LoggingUtils.logInfo("Fetched products for categoryId: " + categoryId +
                    ", result: " + products.getTotalElements() + " items found.");
            return products;
        } catch (Exception ex) {
            LoggingUtils.logError("Error fetching products for categoryId: " + categoryId, ex);
            throw ex;
        }
    }

    @Transactional
    public Page<Product> getAllActiveProducts(Pageable pageable) {
        try {
            Page<Product> products = productRepository.findByActiveTrueAndDeletedFalse(pageable);

            LoggingUtils.logInfo("All products fetched " + products.getTotalElements());

            return products;

        } catch (Exception ex) {
            LoggingUtils.logError("Error fetching all products", ex);
            throw ex;
        }
    }

    @Transactional
    public Product getProductById(Long id) {
        try {
            return productRepository.findById(id)
                    .filter(product -> product.isActive() && !product.isDeleted())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        } catch (Exception ex) {
            LoggingUtils.logError("Error fetching product by id: " + id, ex);

            throw ex;
        }
    }

    @Transactional
    public List<Product> getProductByIds(List<Long> productIds) {
        try {
            List<Product> products = productRepository.findByIdIn(productIds);
            LoggingUtils.logInfo("Product by IDs fetched: " + productIds.size() + " products");
            return products;
        } catch (Exception ex) {
            LoggingUtils.logError("Error fetched products by IDs", ex);
            throw ex;
        }
    }

    @Transactional
    public Product createProduct(CreateProductRequest request) {
        try {
            // Validate category exists
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found with id: " + request.getCategoryId()));

            // Create product
            Product product = new Product(request.getName(), request.getDescription(), request.getPrice(), category);
            product.setActive(request.isActive());

            // Save product first
            product = productRepository.save(product);

            // Create inventory item
            if (request.getStockQuantity() != null && request.getStockQuantity() > 0) {
                InventoryItem inventoryItem = new InventoryItem();
                inventoryItem.setProduct(product);
                inventoryItem.setStockQuantity(request.getStockQuantity());
                inventoryItem.setReservedQuantity(0);
                inventoryRepository.save(inventoryItem);
            }

            LoggingUtils.logInfo("Product created successfully with id: " + product.getId());
            return product;
        } catch (Exception ex) {
            LoggingUtils.logError("Error creating product", ex);
            throw ex;
        }
    }

    @Transactional
    public Product updateProduct(Long id, UpdateProductRequest request) {
        try {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

            // Update fields if provided
            if (request.getName() != null) {
                product.setName(request.getName());
            }
            if (request.getDescription() != null) {
                product.setDescription(request.getDescription());
            }
            if (request.getPrice() != null) {
                product.setPrice(request.getPrice());
            }
            if (request.getCategoryId() != null) {
                Category category = categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Category not found with id: " + request.getCategoryId()));
                product.setCategory(category);
            }
            if (request.getActive() != null) {
                product.setActive(request.getActive());
            }

            // Update inventory if provided
            if (request.getStockQuantity() != null) {
                InventoryItem inventoryItem = product.getInventoryItem();
                if (inventoryItem == null) {
                    inventoryItem = new InventoryItem();
                    inventoryItem.setProduct(product);
                    inventoryItem.setReservedQuantity(0);
                }
                inventoryItem.setStockQuantity(request.getStockQuantity());
                inventoryRepository.save(inventoryItem);
            }

            product = productRepository.save(product);
            LoggingUtils.logInfo("Product updated successfully with id: " + id);
            return product;
        } catch (Exception ex) {
            LoggingUtils.logError("Error updating product with id: " + id, ex);
            throw ex;
        }
    }

    @Transactional
    public void deleteProduct(Long id) {
        try {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

            // Soft delete
            product.setDeleted(true);
            product.setActive(false);
            productRepository.save(product);

            LoggingUtils.logInfo("Product soft deleted successfully with id: " + id);
        } catch (Exception ex) {
            LoggingUtils.logError("Error deleting product with id: " + id, ex);
            throw ex;
        }
    }

    @Transactional
    public Product addProductImage(Long productId, MultipartFile file, String altText) {
        try {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

            // Validate file
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File is empty");
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("File must be an image");
            }

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String fileName = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(fileName);

            // Save file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Create product image entity
            String imageUrl = baseUrl + "/uploads/" + fileName;
            ProductImage productImage = new ProductImage(
                    imageUrl,
                    altText != null ? altText : product.getName(),
                    product.getImages().size(),
                    product);

            // Add to product
            product.getImages().add(productImage);
            product = productRepository.save(product);

            LoggingUtils.logInfo("Image added successfully to product id: " + productId);
            return product;
        } catch (IOException ex) {
            LoggingUtils.logError("Error saving file for product id: " + productId, ex);
            throw new RuntimeException("Error saving file", ex);
        } catch (Exception ex) {
            LoggingUtils.logError("Error adding image to product id: " + productId, ex);
            throw ex;
        }
    }

    @Transactional
    public void deleteProductImage(Long productId, Long imageId) {
        try {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

            ProductImage imageToRemove = product.getImages().stream()
                    .filter(img -> img.getId().equals(imageId))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Image not found with id: " + imageId));

            // Remove image from product
            product.getImages().remove(imageToRemove);
            productRepository.save(product);

            // TODO: Delete physical file from filesystem
            // For now, we'll just remove from database

            LoggingUtils.logInfo("Image deleted successfully from product id: " + productId);
        } catch (Exception ex) {
            LoggingUtils.logError("Error deleting image from product id: " + productId, ex);
            throw ex;
        }
    }

}
