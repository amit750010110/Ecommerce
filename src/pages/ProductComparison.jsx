import React from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Avatar,
  Chip,
  Rating,
  Divider,
  Container,
  Grid,
  Alert,
} from "@mui/material";
import {
  Close,
  AddShoppingCart,
  FavoriteBorder,
  Favorite,
  CompareArrows,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { useCart } from "../contexts/CartContext";
import { useComparison } from "../contexts/ComparisonContext";
import { useNotification } from "../contexts/NotificationContext";

const ProductComparison = () => {
  const { addItem } = useCart();
  const { comparisonItems, removeFromComparison, clearComparison } =
    useComparison();
  const { addNotification } = useNotification();

  const handleAddToCart = (product) => {
    addItem(product, 1);
    addNotification(`${product.name} added to cart!`, "success");
  };

  if (comparisonItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "grey.50",
            borderRadius: 2,
          }}
        >
          <CompareArrows sx={{ fontSize: 80, color: "grey.400", mb: 2 }} />
          <Typography variant="h4" gutterBottom color="text.secondary">
            No products to compare
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Add products to comparison from the catalog to see their detailed
            comparison.
          </Typography>
          <Button
            variant="contained"
            size="large"
            href="/catalog"
            sx={{ mt: 2 }}
          >
            Browse Products
          </Button>
        </Paper>
      </Container>
    );
  }

  const comparisonRows = [
    {
      label: "Product",
      key: "product",
      render: (product) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 2,
          }}
        >
          <Avatar
            src={product.imageUrl || "/placeholder-product.jpg"}
            alt={product.name}
            sx={{ width: 80, height: 80, mb: 2 }}
            variant="rounded"
          />
          <Typography variant="subtitle1" fontWeight="bold" textAlign="center">
            {product.name}
          </Typography>
          {product.category && (
            <Chip
              label={product.category.name}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      ),
    },
    {
      label: "Price",
      key: "price",
      render: (product) => (
        <Typography variant="h5" color="primary" fontWeight="bold">
          ${product.price}
        </Typography>
      ),
    },
    {
      label: "Rating",
      key: "rating",
      render: () => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Rating value={4.5} precision={0.5} readOnly />
          <Typography variant="caption" color="text.secondary">
            (124 reviews)
          </Typography>
        </Box>
      ),
    },
    {
      label: "Availability",
      key: "availability",
      render: (product) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {product.inStock !== false ? (
            <>
              <CheckCircle color="success" sx={{ mr: 1 }} />
              <Typography color="success.main">In Stock</Typography>
            </>
          ) : (
            <>
              <Cancel color="error" sx={{ mr: 1 }} />
              <Typography color="error.main">Out of Stock</Typography>
            </>
          )}
        </Box>
      ),
    },
    {
      label: "Description",
      key: "description",
      render: (product) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            maxWidth: 200,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {product.description}
        </Typography>
      ),
    },
    {
      label: "Actions",
      key: "actions",
      render: (product) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            size="small"
            startIcon={<AddShoppingCart />}
            onClick={() => handleAddToCart(product)}
            disabled={product.inStock === false}
            fullWidth
          >
            Add to Cart
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FavoriteBorder />}
            fullWidth
          >
            Wishlist
          </Button>
          <Button
            variant="text"
            size="small"
            color="error"
            onClick={() => removeFromComparison(product.id)}
          >
            Remove
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Product Comparison
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Compare {comparisonItems.length} products side by side
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          onClick={clearComparison}
          startIcon={<Close />}
        >
          Clear All
        </Button>
      </Box>

      {/* Comparison Limit Alert */}
      {comparisonItems.length >= 4 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You can compare up to 4 products at a time. Remove some products to
          add new ones.
        </Alert>
      )}

      {/* Comparison Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.50" }}>
                Features
              </TableCell>
              {comparisonItems.map((product) => (
                <TableCell
                  key={product.id}
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    bgcolor: "grey.50",
                    position: "relative",
                    minWidth: 200,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => removeFromComparison(product.id)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      color: "error.main",
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                  Product {comparisonItems.indexOf(product) + 1}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {comparisonRows.map((row) => (
              <TableRow key={row.key}>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    fontWeight: "bold",
                    bgcolor: "grey.50",
                    borderRight: 1,
                    borderColor: "divider",
                  }}
                >
                  {row.label}
                </TableCell>
                {comparisonItems.map((product) => (
                  <TableCell key={product.id} align="center" sx={{ py: 3 }}>
                    {row.render(product)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Comparison Summary */}
      <Paper elevation={1} sx={{ mt: 4, p: 3, bgcolor: "grey.50" }}>
        <Typography variant="h6" gutterBottom>
          Comparison Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Most Affordable
            </Typography>
            <Typography variant="body2">
              {
                comparisonItems.reduce((min, product) =>
                  product.price < min.price ? product : min
                ).name
              }{" "}
              - $
              {
                comparisonItems.reduce((min, product) =>
                  product.price < min.price ? product : min
                ).price
              }
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Premium Option
            </Typography>
            <Typography variant="body2">
              {
                comparisonItems.reduce((max, product) =>
                  product.price > max.price ? product : max
                ).name
              }{" "}
              - $
              {
                comparisonItems.reduce((max, product) =>
                  product.price > max.price ? product : max
                ).price
              }
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              In Stock Products
            </Typography>
            <Typography variant="body2">
              {
                comparisonItems.filter((product) => product.inStock !== false)
                  .length
              }{" "}
              out of {comparisonItems.length} available
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProductComparison;
