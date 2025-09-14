import React from "react";
import {
  Drawer,
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
  Badge,
  Paper,
  Avatar,
  Chip,
  useTheme,
} from "@mui/material";
import { 
  Close, 
  ShoppingCart, 
  ShoppingBagOutlined, 
  LocalMallOutlined,
  ArrowForwardIos,
  DeleteOutline
} from "@mui/icons-material";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import CartItem from "./CartItem";

const CartDrawer = ({ open, onClose }) => {
  const { items, total, itemCount, clearCart, hasItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  // Handle checkout
  const handleCheckout = () => {
    console.log("Checkout button clicked");
    console.log("Is authenticated:", isAuthenticated);
    console.log("Items in cart:", items);
    console.log("Total:", total);

    // Close the drawer first
    onClose();

    // Then navigate with a small delay to ensure drawer closes properly
    setTimeout(() => {
      console.log("Navigating to checkout now");
      navigate("/checkout");
    }, 100);
  };

  // Handle clear cart
  const handleClearCart = () => {
    clearCart();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { 
          width: { xs: "100%", sm: 400 },
          boxShadow: '0 0 15px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box display="flex" flexDirection="column" height="100%" sx={{ bgcolor: '#f9f9f9' }}>
        {/* Header */}
        <Paper elevation={0} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2,
          borderRadius: 0,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.primary.main,
          color: 'white'
        }}>
          <Badge 
            badgeContent={itemCount} 
            color="error" 
            sx={{ mr: 2 }}
            overlap="circular"
          >
            <ShoppingBagOutlined fontSize="large" />
          </Badge>
          <Typography variant="h6" fontWeight="bold" flexGrow={1}>
            Your Shopping Bag
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Paper>

        {/* Cart Items */}
        <Box 
          flexGrow={1} 
          overflow="auto" 
          sx={{ 
            p: 2,
            '&::-webkit-scrollbar': {
              width: '6px',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#bdbdbd',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#a5a5a5',
            }
          }}
        >
          {hasItems ? (
            <>
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label={`${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your bag`} 
                  color="primary" 
                  variant="outlined" 
                  size="small"
                />
              </Box>
              {items.map((item) => (
                <Paper 
                  key={item.id} 
                  elevation={0} 
                  sx={{ 
                    mb: 2, 
                    p: 1, 
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CartItem item={item} />
                </Paper>
              ))}
            </>
          ) : (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              textAlign="center" 
              p={4}
              height="100%"
            >
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'rgba(25, 118, 210, 0.1)',
                mb: 2
              }}>
                <LocalMallOutlined sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              </Avatar>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Your bag is empty
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Looks like you haven't added any products to your bag yet.
              </Typography>
              <Button 
                variant="contained" 
                onClick={onClose} 
                sx={{ borderRadius: 4 }}
              >
                Start Shopping
              </Button>
            </Box>
          )}
        </Box>

        {/* Footer */}
        {hasItems && (
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderTopLeftRadius: 16, 
              borderTopRightRadius: 16,
              boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body1" color="text.secondary">Subtotal</Typography>
                <Typography variant="body1">${total.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body1" color="text.secondary">Shipping</Typography>
                <Typography variant="body1">
                  {total > 50 ? 'Free' : '$5.99'}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  ${(total > 50 ? total : total + 5.99).toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleCheckout}
              sx={{ 
                mb: 2, 
                py: 1.5, 
                borderRadius: 2,
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
              }}
              endIcon={<ArrowForwardIos />}
            >
              Checkout
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={handleClearCart}
              color="error"
              sx={{ 
                borderRadius: 2,
                fontWeight: 'medium',
              }}
              startIcon={<DeleteOutline />}
            >
              Clear Bag
            </Button>
          </Paper>
        )}
      </Box>
    </Drawer>
  );
};

export default CartDrawer;
