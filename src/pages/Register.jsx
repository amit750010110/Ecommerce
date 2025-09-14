import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Container, Paper, Typography, Alert } from "@mui/material";
import { TextField, Button, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { authService } from "../services/auth";
const Register = () => {
  const [userData, setuserData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const { isLoading } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || "/";

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setuserData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!userData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      errors.email = "Email is invalid";
    }

    if (!userData.password) {
      errors.password = "Password is required";
    } else if (userData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!userData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (userData.password !== userData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!userData.firstName) {
      errors.firstName = "First name is required";
    }

    if (!userData.lastName) {
      errors.lastName = "Last name is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Prepare data for API (remove confirmPassword and transform field names)
      const { firstName, lastName, ...otherData } = userData;

      // Transform data to match backend expected format
      const registrationData = {
        ...otherData,
        firstname: firstName,
        lastname: lastName,
      };

      // Register user
      await authService.register(registrationData);

      // Show success message
      addNotification(
        "Registration successful! Welcome to our store.",
        "success"
      );

      // Show success alert
      setShowSuccessAlert(true);

      // Redirect to the requested page or home after a short delay
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1500);
    } catch (error) {
      addNotification(error.message || "Registration failed", "error");
      console.error("Registration error:", error);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: "100%" }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Create Account
          </Typography>

          {showSuccessAlert && (
            <Alert
              severity="success"
              variant="filled"
              sx={{ mb: 2 }}
              onClose={() => setShowSuccessAlert(false)}
            >
              Registration successful! Welcome to our store.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="firstName"
              label="First Name"
              name="firstName"
              autoComplete="given-name"
              autoFocus
              value={userData.firstName}
              onChange={handleInputChange}
              error={!!validationErrors.firstName}
              helperText={validationErrors.firstName}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="lastName"
              label="Last Name"
              name="lastName"
              autoComplete="family-name"
              value={userData.lastName}
              onChange={handleInputChange}
              error={!!validationErrors.lastName}
              helperText={validationErrors.lastName}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={userData.email}
              onChange={handleInputChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              value={userData.password}
              onChange={handleInputChange}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleInputChange}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
            <Box textAlign="center">
              <Typography variant="body2">
                Already have an account?{" "}
                <Link
                  to="/login"
                  state={{ from: location.state?.from }}
                  style={{ textDecoration: "none" }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
