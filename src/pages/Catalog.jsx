import React, { useEffect, useCallback } from "react";
import {
  Container,
  Grid,
  Box,
  Pagination,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import { FilterList, Clear } from "@mui/icons-material";
import { useCatalog } from "../contexts/CatalogContext";
import { useDebounce } from "../hooks/useDebounce";
import ProductGrid from "../components/ProductGrid";
import FilterPanel from "../components/FilterPanel";

const Catalog = () => {
  const {
    products,
    filters,
    pagination,
    isLoading,
    fetchProducts,
    updateFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters,
    filteredProductsCount,
  } = useCatalog();

  // useDebounce: search input ko debounce karta hai (300ms delay)
  // Isse avoid hota hai har keystroke pe API call
  const debouncedSearch = useDebounce(filters.search, 300);

  // useEffect: debounced search ya filters change hone pe products fetch karta hai
  useEffect(() => {
    // Initial load - fetch products once on component mount
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  // Handle filter changes and pagination
  useEffect(() => {
    // Skip the initial render to avoid duplicate API calls
    const timer = setTimeout(() => {
      // Only fetch if filters or pagination changes
      if (
        debouncedSearch ||
        filters.categoryIds.length > 0 ||
        filters.minPrice !== null ||
        filters.maxPrice !== null ||
        pagination.page > 0
      ) {
        fetchProducts();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [
    debouncedSearch,
    filters.categoryIds,
    filters.minPrice,
    filters.maxPrice,
    filters.sort.by,
    filters.sort.direction,
    pagination.page,
    fetchProducts,
  ]);

  // Handle page change
  const handlePageChange = useCallback(
    (event, page) => {
      updatePagination({ page: page - 1 }); // MUI Pagination uses 1-based index, API uses 0-based
      // fetchProducts will be called automatically by useEffect when pagination changes
    },
    [updatePagination]
  );

  // Handle filter change
  const handleFilterChange = useCallback(
    (newFilters) => {
      // Map from FilterPanel format to CatalogContext format
      const mappedFilters = { ...newFilters };

      // Special handling for sort
      if (newFilters.sortBy) {
        if (newFilters.sortBy === "price_asc") {
          mappedFilters.sort = { by: "price", direction: "asc" };
          delete mappedFilters.sortBy;
        } else if (newFilters.sortBy === "price_desc") {
          mappedFilters.sort = { by: "price", direction: "desc" };
          delete mappedFilters.sortBy;
        } else if (newFilters.sortBy === "name_asc") {
          mappedFilters.sort = { by: "name", direction: "asc" };
          delete mappedFilters.sortBy;
        } else if (newFilters.sortBy === "name_desc") {
          mappedFilters.sort = { by: "name", direction: "desc" };
          delete mappedFilters.sortBy;
        } else if (newFilters.sortBy === "newest") {
          mappedFilters.sort = { by: "id", direction: "desc" };
          delete mappedFilters.sortBy;
        }
      }

      updateFilters(mappedFilters);
    },
    [updateFilters]
  );

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  // Handle add to cart (will be implemented in CartContext)
  const handleAddToCart = useCallback((product) => {
    // This function is not used since ProductCard component uses its own CartContext
    console.log("Add to cart from catalog page:", product);
  }, []);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Filter Panel */}
        <Grid item xs={12} md={3}>
          <FilterPanel
            filters={filters}
            updateFilters={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </Grid>

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h4" component="h1">
              Products
              {filteredProductsCount > 0 && (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  component="span"
                  ml={1}
                >
                  ({filteredProductsCount} products found)
                </Typography>
              )}
            </Typography>

            {hasActiveFilters && (
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleClearFilters}
                size="small"
              >
                Clear Filters
              </Button>
            )}
          </Box>

          {/* Active Filters Chips */}
          {hasActiveFilters && (
            <Box mb={2}>
              {filters.search && (
                <Chip
                  label={`Search: ${filters.search}`}
                  onDelete={() => handleFilterChange({ search: "" })}
                  sx={{ m: 0.5 }}
                />
              )}
              {filters.categoryIds.length > 0 && (
                <Chip
                  label={`Categories: ${filters.categoryIds.length}`}
                  onDelete={() => handleFilterChange({ categoryIds: [] })}
                  sx={{ m: 0.5 }}
                />
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <Chip
                  label={`Price: ${filters.minPrice || "0"} - ${
                    filters.maxPrice || "∞"
                  }`}
                  onDelete={() =>
                    handleFilterChange({ minPrice: null, maxPrice: null })
                  }
                  sx={{ m: 0.5 }}
                />
              )}
            </Box>
          )}

          {/* Products Grid */}
          <ProductGrid
            products={products}
            isLoading={isLoading}
            onAddToCart={handleAddToCart}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page + 1} // Convert 0-based to 1-based
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Catalog;
