import { httpService } from "./http";

// Mock products data since backend may not be running or have no products
const mockProducts = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 99.99,
    imageUrl: "https://via.placeholder.com/300x300?text=Headphones",
    category: { id: 1, name: "Electronics" },
    inStock: true,
    stockQuantity: 50,
    rating: 4.5,
    images: [
      { id: 1, url: "https://via.placeholder.com/300x300?text=Headphones", altText: "Wireless Headphones" }
    ]
  },
  {
    id: 2,
    name: "Smartphone Case",
    description: "Protective case for smartphones with wireless charging support",
    price: 24.99,
    imageUrl: "https://via.placeholder.com/300x300?text=Phone+Case",
    category: { id: 1, name: "Electronics" },
    inStock: true,
    stockQuantity: 100,
    rating: 4.0,
    images: [
      { id: 2, url: "https://via.placeholder.com/300x300?text=Phone+Case", altText: "Smartphone Case" }
    ]
  },
  {
    id: 3,
    name: "Cotton T-Shirt",
    description: "Comfortable cotton t-shirt available in multiple colors",
    price: 19.99,
    imageUrl: "https://via.placeholder.com/300x300?text=T-Shirt",
    category: { id: 2, name: "Clothing" },
    inStock: true,
    stockQuantity: 75,
    rating: 3.5,
    images: [
      { id: 3, url: "https://via.placeholder.com/300x300?text=T-Shirt", altText: "Cotton T-Shirt" }
    ]
  },
  {
    id: 4,
    name: "Programming Book",
    description: "Learn modern web development with this comprehensive guide",
    price: 39.99,
    imageUrl: "https://via.placeholder.com/300x300?text=Programming+Book",
    category: { id: 3, name: "Books" },
    inStock: true,
    stockQuantity: 25,
    rating: 5.0,
    images: [
      { id: 4, url: "https://via.placeholder.com/300x300?text=Programming+Book", altText: "Programming Book" }
    ]
  },
  {
    id: 5,
    name: "Garden Tools Set",
    description: "Complete set of garden tools for your gardening needs",
    price: 79.99,
    imageUrl: "https://via.placeholder.com/300x300?text=Garden+Tools",
    category: { id: 4, name: "Home & Garden" },
    inStock: true,
    stockQuantity: 15,
    rating: 3.0,
    images: [
      { id: 5, url: "https://via.placeholder.com/300x300?text=Garden+Tools", altText: "Garden Tools Set" }
    ]
  },
  {
    id: 6,
    name: "Laptop Stand",
    description: "Adjustable laptop stand for better ergonomics",
    price: 49.99,
    imageUrl: "https://via.placeholder.com/300x300?text=Laptop+Stand",
    category: { id: 1, name: "Electronics" },
    inStock: true,
    stockQuantity: 30,
    rating: 2.5,
    images: [
      { id: 6, url: "https://via.placeholder.com/300x300?text=Laptop+Stand", altText: "Laptop Stand" }
    ]
  }
];

// Catalog service for product-related API calls 
export const catalogService = {
  // Get products with filter pagination and sorting 
  async getProducts(params = {}) {
    try {
      // Try to get from backend first, fallback to mock data
      try {
        // Build query starting from params 
        const queryParams = new URLSearchParams();

        // Process each parameter and add it to the query string
        Object.keys(params).forEach(key => {
          if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
            // Handle arrays like categoryIds
            if (Array.isArray(params[key])) {
              if (params[key].length > 0) {
                params[key].forEach(value => queryParams.append(key, value));
              }
            }
            // Handle nested objects like sort
            else if (typeof params[key] === 'object' && !Array.isArray(params[key])) {
              Object.keys(params[key]).forEach(nestedKey => {
                if (params[key][nestedKey]) {
                  queryParams.append(`${key}.${nestedKey}`, params[key][nestedKey]);
                }
              });
            }
            // Handle simple values
            else {
              queryParams.append(key, params[key]);
            }
          }
        });

        const queryString = queryParams.toString();
        const url = `/catalog/products${queryString ? `?${queryString}` : ''}`;

        console.log('Fetching products with URL:', url);
        try {
          return await httpService.get(url);
        } catch (error) {
          console.error('Error fetching from backend:', error);
          throw error; // Rethrow to trigger the mock data fallback
        }
      } catch {
        console.log('Backend not available, using mock data');

        // Apply filters to mock data
        let filteredProducts = [...mockProducts];

        // Search filter
        if (params.search) {
          const searchTerm = params.search.toLowerCase();
          filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
          );
        }

        // Category filter
        if (params.categoryIds && params.categoryIds.length > 0) {
          filteredProducts = filteredProducts.filter(product => {
            // Check if product.category.id matches any of the categoryIds
            return params.categoryIds.some(catId =>
              product.category.id.toString() === catId.toString()
            );
          });
        }

        // Price range filter
        if (params.minPrice) {
          filteredProducts = filteredProducts.filter(product =>
            product.price >= parseFloat(params.minPrice)
          );
        }

        if (params.maxPrice) {
          filteredProducts = filteredProducts.filter(product =>
            product.price <= parseFloat(params.maxPrice)
          );
        }

        // In stock filter
        if (params.inStockOnly) {
          filteredProducts = filteredProducts.filter(product => product.inStock);
        }

        // Rating filter
        if (params.minRating) {
          const minRating = parseFloat(params.minRating);
          filteredProducts = filteredProducts.filter(product =>
            (product.rating || 0) >= minRating
          );
        }

        // Apply pagination
        const page = parseInt(params.page) || 0;
        const size = parseInt(params.size) || 12;
        const startIndex = page * size;
        const endIndex = startIndex + size;

        // Create a stable sort function
        let sortedProducts = [...filteredProducts];
        if (params.sortBy) {
          const sortBy = params.sortBy;
          const sortDir = params.sortDir || 'asc';
          sortedProducts.sort((a, b) => {
            let valueA = a[sortBy];
            let valueB = b[sortBy];

            // Handle nested properties
            if (sortBy.includes('.')) {
              const parts = sortBy.split('.');
              valueA = parts.reduce((obj, key) => obj?.[key], a);
              valueB = parts.reduce((obj, key) => obj?.[key], b);
            }

            if (valueA < valueB) return sortDir === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortDir === 'asc' ? 1 : -1;
            return 0;
          });
        }

        const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

        return {
          data: {
            content: paginatedProducts,
            totalElements: filteredProducts.length,
            totalPages: Math.ceil(filteredProducts.length / size),
            size: size,
            number: page
          }
        };
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  },

  // Get product by id 
  async getProductById(id) {
    try {
      // Try to get from backend first, fallback to mock data
      try {
        return await httpService.get(`/catalog/products/${id}`);
      } catch {
        console.log('Backend not available, using mock data');

        const product = mockProducts.find(p => p.id === parseInt(id));
        if (!product) {
          throw new Error('Product not found');
        }

        return {
          data: product
        };
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  },

  // Create new product (Admin only)
  async createProduct(productData) {
    try {
      return await httpService.post('/catalog/products', productData);
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  },

  // Update product (Admin only)
  async updateProduct(id, productData) {
    try {
      return await httpService.put(`/catalog/products/${id}`, productData);
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  },

  // Delete product (Admin only)
  async deleteProduct(id) {
    try {
      return await httpService.delete(`/catalog/products/${id}`);
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  },

  // Upload product image (Admin only)
  async uploadProductImage(productId, imageFile, altText) {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      if (altText) {
        formData.append('altText', altText);
      }

      return await httpService.postFormData(`/catalog/products/${productId}/images`, formData);
    } catch (error) {
      console.error('Failed to upload product image:', error);
      throw error;
    }
  },

  // Delete product image (Admin only)
  async deleteProductImage(productId, imageId) {
    try {
      return await httpService.delete(`/catalog/products/${productId}/images/${imageId}`);
    } catch (error) {
      console.error('Failed to delete product image:', error);
      throw error;
    }
  },

  // Get categories (temporarily disabled - backend endpoint not implemented)
  async getCategories() {
    // Return mock data since backend doesn't have categories endpoint yet
    return {
      data: {
        content: [
          { id: 1, name: 'Electronics', parentId: null },
          { id: 2, name: 'Clothing', parentId: null },
          { id: 3, name: 'Books', parentId: null },
          { id: 4, name: 'Home & Garden', parentId: null }
        ]
      }
    };
  },

  // Get top-level categories
  async getTopLevelCategories() {
    try {
      return await httpService.get('/catalog/categories/top-level');
    } catch (error) {
      console.error('Failed to fetch top-level categories:', error);
      throw error;
    }
  }
};



