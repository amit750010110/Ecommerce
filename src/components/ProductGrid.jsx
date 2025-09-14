import React, { memo } from "react";
import { Grid, Box, CircularProgress, Typography } from "@mui/material";
import ProductCard from "./ProductCard";

const ProductGrid = memo(({ products, isLoading, onAddToCart }) => {
  // Loading state
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Typography variant="h6" color="text.secondary">
          No products found
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
          <ProductCard product={product} onAddToCart={onAddToCart} />
        </Grid>
      ))}
    </Grid>
  );
});

export default ProductGrid;
