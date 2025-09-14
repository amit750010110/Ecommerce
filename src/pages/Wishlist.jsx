import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  Divider,
  Container,
  Paper,
  Alert,
  Rating,
} from "@mui/material";
import {
  DeleteOutline,
  AddShoppingCart,
  Share,
  ShoppingCartOutlined,
  FavoriteOutlined,
} from "@mui/icons-material";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useNotification } from "../contexts/NotificationContext";

const Wishlist = () => {
  const { addItem } = useCart();
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addNotification } = useNotification();

  const moveToCart = (product) => {
    addItem(product, 1);
    removeFromWishlist(product.id);
    addNotification(`${product.name} moved to cart!`, "success");
  };

  const handleShare = (product) => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: `${window.location.origin}/product/${product.id}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/product/${product.id}`
      );
      addNotification("Product link copied to clipboard!", "success");
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "grey.50",
            borderRadius: 2,
          }}
        >
          <FavoriteOutlined sx={{ fontSize: 80, color: "grey.400", mb: 2 }} />
          <Typography variant="h4" gutterBottom color="text.secondary">
            Your wishlist is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Save your favorite products to your wishlist and come back to them
            later.
          </Typography>
          <Button
            variant="contained"
            size="large"
            href="/catalog"
            sx={{ mt: 2 }}
          >
            Start Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
            My Wishlist
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {wishlistItems.length}{" "}
            {wishlistItems.length === 1 ? "item" : "items"} saved
          </Typography>
        </Box>
        {wishlistItems.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            onClick={clearWishlist}
            startIcon={<DeleteOutline />}
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Wishlist Items */}
      <Grid container spacing={3}>
        {wishlistItems.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: (theme) => theme.shadows[8],
                  transition: "all 0.3s ease-in-out",
                },
              }}
            >
              {/* Stock Status Badge */}
              {product.inStock === false && (
                <Chip
                  label="Out of Stock"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    zIndex: 1,
                    bgcolor: "rgba(0,0,0,0.7)",
                    color: "white",
                  }}
                />
              )}

              {/* Product Image */}
              <CardMedia
                component="img"
                height="200"
                image={product.imageUrl || "/placeholder-product.jpg"}
                alt={product.name}
                sx={{
                  objectFit: "cover",
                  filter: product.inStock === false ? "grayscale(1)" : "none",
                }}
              />

              {/* Product Details */}
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                {/* Category */}
                {product.category && (
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{
                      fontWeight: "medium",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {product.category.name}
                  </Typography>
                )}

                {/* Product Name */}
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    lineHeight: 1.3,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {product.name}
                </Typography>

                {/* Rating */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Rating value={4.5} precision={0.5} size="small" readOnly />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    (24)
                  </Typography>
                </Box>

                {/* Price */}
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  ${product.price}
                </Typography>

                {/* Description */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {product.description}
                </Typography>
              </CardContent>

              <Divider />

              {/* Action Buttons */}
              <CardActions sx={{ p: 2, pt: 1 }}>
                <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddShoppingCart />}
                    onClick={() => moveToCart(product)}
                    disabled={product.inStock === false}
                    sx={{ flex: 1 }}
                  >
                    Add to Cart
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => handleShare(product)}
                    color="default"
                  >
                    <Share />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => removeFromWishlist(product.id)}
                    color="error"
                  >
                    <DeleteOutline />
                  </IconButton>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Wishlist Actions */}
      {wishlistItems.length > 0 && (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Paper elevation={1} sx={{ p: 3, bgcolor: "grey.50" }}>
            <Typography variant="h6" gutterBottom>
              Ready to purchase?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add all available items to your cart with one click
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCartOutlined />}
              onClick={() => {
                const availableItems = wishlistItems.filter(
                  (item) => item.inStock !== false
                );
                availableItems.forEach((product) => moveToCart(product));
              }}
              disabled={wishlistItems.every((item) => item.inStock === false)}
            >
              Add All to Cart
            </Button>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default Wishlist;
