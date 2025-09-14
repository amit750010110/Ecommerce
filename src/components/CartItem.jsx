import React from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Divider,
  Avatar,
  Paper,
  Tooltip,
  Chip,
  Badge,
  useTheme,
} from "@mui/material";
import {
  Add,
  Remove,
  DeleteOutline,
  FavoriteBorder,
  HighlightOff,
} from "@mui/icons-material";
import { useCart } from "../contexts/CartContext";

const CartItem = ({ item }) => {
  const { updateItemQuantity, removeItem } = useCart();
  const theme = useTheme();

  // Handle quantity increase
  const handleIncrease = () => {
    updateItemQuantity(item.id, item.quantity + 1);
  };

  // Handle quantity decrease
  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateItemQuantity(item.id, item.quantity - 1);
    } else {
      removeItem(item.id);
    }
  };

  // Handle quantity input change (currently unused but kept for future functionality)
  // eslint-disable-next-line no-unused-vars
  const handleQuantityChange = (event) => {
    const newQuantity = parseInt(event.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      updateItemQuantity(item.id, newQuantity);
    }
  };

  // Handle item removal
  const handleRemove = () => {
    removeItem(item.id);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" sx={{ position: "relative" }}>
        {/* Remove Button (top right corner) */}
        <IconButton
          onClick={handleRemove}
          size="small"
          sx={{
            position: "absolute",
            top: -8,
            right: -8,
            bgcolor: "rgba(255,255,255,0.9)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            "&:hover": {
              bgcolor: theme.palette.error.light,
              color: "white",
            },
            zIndex: 1,
          }}
        >
          <HighlightOff fontSize="small" />
        </IconButton>

        {/* Product Image */}
        <Badge
          badgeContent={item.quantity > 1 ? item.quantity : 0}
          color="primary"
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          overlap="circular"
        >
          <Avatar
            src={
              item.image ||
              `https://via.placeholder.com/64x64?text=${item.name}`
            }
            alt={item.name}
            sx={{
              width: 70,
              height: 70,
              mr: 2,
              borderRadius: 2,
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              border: "1px solid #eee",
            }}
            variant="rounded"
          />
        </Badge>

        {/* Product Details */}
        <Box flexGrow={1} pr={1}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: "medium",
              maxWidth: "180px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.name}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 0.5,
            }}
          >
            <Typography
              variant="subtitle2"
              color="primary.main"
              fontWeight="bold"
            >
              ${item.price?.toFixed(2)}
            </Typography>

            {/* Quantity Controls */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <IconButton
                size="small"
                onClick={handleDecrease}
                disabled={item.quantity <= 1}
                sx={{ borderRadius: 0, p: 0.5 }}
              >
                <Remove fontSize="small" />
              </IconButton>

              <Typography sx={{ px: 1, minWidth: "24px", textAlign: "center" }}>
                {item.quantity}
              </Typography>

              <IconButton
                size="small"
                onClick={handleIncrease}
                sx={{ borderRadius: 0, p: 0.5 }}
              >
                <Add fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Item Total */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Item total: <b>${(item.price * item.quantity).toFixed(2)}</b>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CartItem;
