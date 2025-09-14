import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Rating,
  Chip,
  IconButton,
  Badge,
  Divider,
  ImageList,
  ImageListItem,
  Card,
  CardContent,
} from "@mui/material";
import {
  Close,
  AddShoppingCart,
  FavoriteBorder,
  Favorite,
  Share,
  Add,
  Remove,
  LocalShipping,
  Security,
  Verified,
} from "@mui/icons-material";
import { useCart } from "../contexts/CartContext";
import { useNotification } from "../contexts/NotificationContext";

const ProductQuickView = ({ product, open, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCart();
  const { addNotification } = useNotification();

  if (!product) return null;

  // Product images with fallback
  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            url: product.imageUrl || "/placeholder-product.jpg",
            altText: product.name,
          },
        ];

  const handleAddToCart = () => {
    addItem(product, quantity);
    addNotification(`${product.name} (${quantity}) added to cart!`, "success");
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    addNotification(
      isWishlisted
        ? `${product.name} removed from wishlist`
        : `${product.name} added to wishlist`,
      "info"
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addNotification("Product link copied to clipboard!", "success");
    }
  };

  const isInStock =
    product.inStock !== false &&
    (product.stockQuantity === undefined || product.stockQuantity > 0);
  const isLowStock = product.stockQuantity && product.stockQuantity < 10;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: "90vh" },
      }}
    >
      <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <Grid container spacing={0} sx={{ minHeight: 500 }}>
          {/* Product Images */}
          <Grid item xs={12} md={6} sx={{ p: 0 }}>
            <Box sx={{ position: "relative", height: "100%" }}>
              {/* Main Image */}
              <Box
                component="img"
                src={productImages[selectedImage]?.url}
                alt={productImages[selectedImage]?.altText || product.name}
                sx={{
                  width: "100%",
                  height: 400,
                  objectFit: "cover",
                  borderRadius: "8px 0 0 0",
                }}
              />

              {/* Stock Badge */}
              {!isInStock && (
                <Chip
                  label="Out of Stock"
                  color="default"
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    bgcolor: "rgba(0,0,0,0.7)",
                    color: "white",
                  }}
                />
              )}

              {isLowStock && isInStock && (
                <Chip
                  label="Low Stock"
                  color="warning"
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                  }}
                />
              )}

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    left: 16,
                    right: 16,
                    display: "flex",
                    gap: 1,
                    overflow: "auto",
                  }}
                >
                  {productImages.map((image, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={image.url}
                      alt={image.altText}
                      onClick={() => setSelectedImage(index)}
                      sx={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 1,
                        cursor: "pointer",
                        border: selectedImage === index ? 2 : 1,
                        borderColor:
                          selectedImage === index ? "primary.main" : "grey.300",
                        "&:hover": { borderColor: "primary.main" },
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} md={6} sx={{ p: 3 }}>
            <Box
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              {/* Category */}
              {product.category && (
                <Typography
                  variant="caption"
                  color="primary"
                  sx={{
                    fontWeight: "medium",
                    textTransform: "uppercase",
                    mb: 1,
                  }}
                >
                  {product.category.name}
                </Typography>
              )}

              {/* Product Name */}
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: "bold", mb: 2 }}
              >
                {product.name}
              </Typography>

              {/* Rating and Reviews */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Rating value={4.5} precision={0.5} readOnly />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  (124 reviews)
                </Typography>
              </Box>

              {/* Price */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h3"
                  color="primary"
                  sx={{ fontWeight: "bold" }}
                >
                  ${product.price}
                </Typography>
                {/* You can add original price and discount here */}
              </Box>

              {/* Description */}
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, lineHeight: 1.6 }}
              >
                {product.description}
              </Typography>

              {/* Stock Information */}
              {isInStock && product.stockQuantity && (
                <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
                  ✓ {product.stockQuantity} items in stock
                </Typography>
              )}

              {/* Quantity Selector */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Typography variant="body1">Quantity:</Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    border: 1,
                    borderColor: "grey.300",
                    borderRadius: 1,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Remove />
                  </IconButton>
                  <Typography sx={{ px: 2, minWidth: 40, textAlign: "center" }}>
                    {quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={
                      !isInStock ||
                      (product.stockQuantity &&
                        quantity >= product.stockQuantity)
                    }
                  >
                    <Add />
                  </IconButton>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddShoppingCart />}
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                  sx={{ flex: 1 }}
                >
                  Add to Cart
                </Button>
                <IconButton
                  size="large"
                  onClick={handleWishlistToggle}
                  color={isWishlisted ? "error" : "default"}
                >
                  {isWishlisted ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <IconButton size="large" onClick={handleShare}>
                  <Share />
                </IconButton>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Product Features */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <LocalShipping color="primary" />
                    <Typography variant="body2">
                      Free shipping on orders over $50
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Security color="primary" />
                    <Typography variant="body2">
                      Secure payment with SSL encryption
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Verified color="primary" />
                    <Typography variant="body2">
                      30-day return guarantee
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;
