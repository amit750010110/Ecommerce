import React, { useState, memo } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Rating,
  Chip,
  IconButton,
  Tooltip,
  Badge,
  Zoom,
  Skeleton,
} from "@mui/material";
import {
  AddShoppingCart,
  FavoriteBorder,
  Favorite,
  Visibility,
  Share,
  LocalOffer,
  CompareArrows,
} from "@mui/icons-material";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useComparison } from "../contexts/ComparisonContext";
import { useNotification } from "../contexts/NotificationContext";
import ProductQuickView from "./ProductQuickView";

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { addNotification } = useNotification();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInComparison, toggleComparison, canAddToComparison } =
    useComparison();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Handle add to cart click
  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product, 1);
    addNotification(`${product.name} added to cart!`, "success");
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  // Handle comparison toggle
  const handleComparisonToggle = (e) => {
    e.stopPropagation();
    toggleComparison(product);
  };

  // Handle quick view
  const handleQuickView = (e) => {
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  // Handle share
  const handleShare = (e) => {
    e.stopPropagation();
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

  // Calculate discount percentage (mock data)
  const originalPrice = product.price * 1.2; // Assume 20% discount
  const discountPercentage = Math.round(
    ((originalPrice - product.price) / originalPrice) * 100
  );

  // Check if product is in stock
  const isInStock =
    product.inStock !== false &&
    (product.stockQuantity === undefined || product.stockQuantity > 0);
  const isLowStock = product.stockQuantity && product.stockQuantity < 10;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        cursor: "pointer",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <Chip
          label={`-${discountPercentage}%`}
          color="error"
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 1,
            fontWeight: "bold",
          }}
        />
      )}

      {/* Stock Status Badge */}
      {!isInStock && (
        <Chip
          label="Out of Stock"
          color="default"
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
            bgcolor: "rgba(0,0,0,0.7)",
            color: "white",
          }}
        />
      )}

      {isLowStock && isInStock && (
        <Chip
          label="Low Stock"
          color="warning"
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
          }}
        />
      )}

      {/* Action Buttons Overlay */}
      <Zoom in={isHovered}>
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            zIndex: 2,
          }}
        >
          <Tooltip title="Add to Wishlist" placement="left">
            <IconButton
              size="small"
              onClick={handleWishlistToggle}
              sx={{
                bgcolor: "rgba(255,255,255,0.9)",
                "&:hover": { bgcolor: "white" },
              }}
            >
              {isInWishlist(product.id) ? (
                <Favorite color="error" />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Quick View" placement="left">
            <IconButton
              size="small"
              onClick={handleQuickView}
              sx={{
                bgcolor: "rgba(255,255,255,0.9)",
                "&:hover": { bgcolor: "white" },
              }}
            >
              <Visibility />
            </IconButton>
          </Tooltip>

          <Tooltip title="Share" placement="left">
            <IconButton
              size="small"
              onClick={handleShare}
              sx={{
                bgcolor: "rgba(255,255,255,0.9)",
                "&:hover": { bgcolor: "white" },
              }}
            >
              <Share />
            </IconButton>
          </Tooltip>

          <Tooltip title="Compare" placement="left">
            <IconButton
              size="small"
              onClick={handleComparisonToggle}
              disabled={!canAddToComparison() && !isInComparison(product.id)}
              sx={{
                bgcolor: "rgba(255,255,255,0.9)",
                "&:hover": { bgcolor: "white" },
                color: isInComparison(product.id) ? "primary.main" : "inherit",
              }}
            >
              <CompareArrows />
            </IconButton>
          </Tooltip>
        </Box>
      </Zoom>

      {/* Product Image */}
      <Box sx={{ position: "relative", paddingTop: "75%", overflow: "hidden" }}>
        {!imageLoaded && (
          <Skeleton
            variant="rectangular"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />
        )}
        <CardMedia
          component="img"
          image={
            product.images?.[0]?.url ||
            product.imageUrl ||
            "/placeholder-product.jpg"
          }
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.3s ease-in-out",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Product Category */}
        {product.category && (
          <Typography
            variant="caption"
            color="primary"
            sx={{ fontWeight: "medium", textTransform: "uppercase" }}
          >
            {product.category.name}
          </Typography>
        )}

        {/* Product Name */}
        <Typography
          gutterBottom
          variant="h6"
          component="h3"
          sx={{
            fontWeight: "600",
            lineHeight: 1.2,
            height: "2.4em",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product.name}
        </Typography>

        {/* Product Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            height: "3em",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            mb: 1,
          }}
        >
          {product.description}
        </Typography>

        {/* Rating */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Rating value={4.5} precision={0.5} readOnly size="small" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            (24 reviews)
          </Typography>
        </Box>

        {/* Price Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
            ${product.price}
          </Typography>
          {discountPercentage > 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: "line-through" }}
            >
              ${originalPrice.toFixed(2)}
            </Typography>
          )}
        </Box>

        {/* Stock Information */}
        {isInStock && product.stockQuantity && (
          <Typography variant="caption" color="text.secondary">
            {product.stockQuantity} in stock
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: "center", p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddShoppingCart />}
          onClick={handleAddToCart}
          disabled={!isInStock}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: "600",
            py: 1,
          }}
        >
          {isInStock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </CardActions>

      {/* Quick View Dialog */}
      <ProductQuickView
        product={product}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </Card>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(ProductCard, (prevProps, nextProps) => {
  // Only re-render if product id changes or if critical properties change
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.name === nextProps.product.name
  );
});
