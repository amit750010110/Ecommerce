import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Button,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Container,
  Fab,
  Tooltip,
} from "@mui/material";
import {
  ShoppingCart,
  AccountCircle,
  Menu as MenuIcon,
  Store,
  Receipt,
  Person,
  LocationOn,
  AdminPanelSettings,
  Logout,
  Home,
  KeyboardArrowUp,
  Favorite,
  CompareArrows,
} from "@mui/icons-material";

import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import CartDrawer from "./CartDrawer";
import ScrollToTop from "./ScrollToTop";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { itemCount } = useCart();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Navigation items for all users
  const publicNavigationItems = [
    { label: "Catalog", path: "/catalog", icon: <Store /> },
    { label: "Compare", path: "/compare", icon: <CompareArrows /> },
  ];

  // Navigation items for authenticated users
  const authenticatedNavigationItems = [
    { label: "Wishlist", path: "/wishlist", icon: <Favorite /> },
    { label: "Orders", path: "/orders", icon: <Receipt /> },
    { label: "Profile", path: "/profile", icon: <Person /> },
    { label: "Addresses", path: "/addresses", icon: <LocationOn /> },
  ];

  // Admin navigation items
  const adminItems = [
    { label: "Admin Dashboard", path: "/admin", icon: <AdminPanelSettings /> },
  ];

  // Handle scroll to show/hide scroll to top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleCartToggle = () => {
    setCartOpen(!cartOpen);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const isCurrentPath = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              mr: 4,
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={() => navigate("/catalog")}
          >
            E-Commerce
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
              {/* Public navigation items always displayed */}
              {publicNavigationItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    backgroundColor: isCurrentPath(item.path)
                      ? "rgba(255, 255, 255, 0.1)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}

              {/* Authenticated navigation items only shown when logged in */}
              {isAuthenticated &&
                authenticatedNavigationItems.map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    startIcon={item.icon}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      backgroundColor: isCurrentPath(item.path)
                        ? "rgba(255, 255, 255, 0.1)"
                        : "transparent",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}

              {hasRole("ADMIN") &&
                adminItems.map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    startIcon={item.icon}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      backgroundColor: isCurrentPath(item.path)
                        ? "rgba(255, 255, 255, 0.1)"
                        : "transparent",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
            </Box>
          )}

          {/* Cart Icon */}
          <Tooltip title="Shopping Cart">
            <IconButton
              color="inherit"
              onClick={handleCartToggle}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={itemCount} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Tooltip title={isAuthenticated ? "Account" : "Login"}>
            <IconButton
              color="inherit"
              onClick={
                isAuthenticated ? handleMenuOpen : () => navigate("/login")
              }
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: isAuthenticated ? "secondary.main" : "primary.main",
                }}
                alt={user?.firstname}
              >
                {isAuthenticated ? (
                  user?.firstname?.charAt(0) || <AccountCircle />
                ) : (
                  <AccountCircle />
                )}
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* User Account Menu Dropdown (only for authenticated users) */}
          {isAuthenticated && (
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {user?.firstname} {user?.lastname}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => handleNavigation("/profile")}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={() => handleNavigation("/orders")}>
                <ListItemIcon>
                  <Receipt fontSize="small" />
                </ListItemIcon>
                Orders
              </MenuItem>
              {hasRole("ADMIN") && (
                <MenuItem onClick={() => handleNavigation("/admin")}>
                  <ListItemIcon>
                    <AdminPanelSettings fontSize="small" />
                  </ListItemIcon>
                  Admin Dashboard
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <Typography variant="h6" sx={{ px: 2, mb: 2, fontWeight: "bold" }}>
            Navigation
          </Typography>
          <Divider />

          <List>
            {/* Public navigation for all users */}
            {publicNavigationItems.map((item) => (
              <ListItem
                key={item.path}
                button
                onClick={() => handleNavigation(item.path)}
                selected={isCurrentPath(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}

            {/* Authenticated navigation only for logged in users */}
            {isAuthenticated && (
              <>
                <Divider sx={{ my: 1 }} />
                {authenticatedNavigationItems.map((item) => (
                  <ListItem
                    key={item.path}
                    button
                    onClick={() => handleNavigation(item.path)}
                    selected={isCurrentPath(item.path)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItem>
                ))}
              </>
            )}

            {/* Login/Logout section */}
            <Divider sx={{ my: 1 }} />
            {isAuthenticated ? (
              <ListItem button onClick={handleLogout}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            ) : (
              <ListItem button onClick={() => navigate("/login")}>
                <ListItemIcon>
                  <AccountCircle />
                </ListItemIcon>
                <ListItemText primary="Login" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default" }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <Fab
          color="primary"
          size="small"
          onClick={scrollToTop}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      )}

      {/* Scroll to Top Component */}
      <ScrollToTop />
    </Box>
  );
};

export default Layout;
