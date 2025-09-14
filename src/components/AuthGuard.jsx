import { Box, CircularProgress, Typography, Button } from "@mui/material";
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const AuthGuard = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignContent="center"
        minHeight="50vh"
        flexDirection="column"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Checking Authentication ...
        </Typography>
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    console.log(
      "User not authenticated, redirecting to login from",
      location.pathname
    );

    // Save the current location to redirect back after login
    const redirectPath = location.pathname;

    // Redirect to login page with return path
    setTimeout(() => {
      navigate("/login", {
        state: { from: redirectPath },
        replace: true,
      });
    }, 100);

    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        flexDirection="column"
      >
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="h5" color="primary" gutterBottom>
          Authentication Required
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Please log in to access this page. Redirecting to login...
        </Typography>
      </Box>
    );
  }
  // Check if user has required role
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        flexDirection="column"
      >
        <Typography variant="h4" color="error" gutterBottom>
          Permission Denied
        </Typography>
        <Typography variant="body1">
          You don't have permission to access this page.
        </Typography>
      </Box>
    );
  }

  // User is authenticated and has required role
  return children;
};

export default AuthGuard;
