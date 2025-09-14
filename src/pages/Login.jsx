import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, LockClock } from "@mui/icons-material";
const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { login, isLoading, error, loginAttempts, lockoutUntil } = useAuth();
  const { addNotification } = useNotification();
  const MAX_LOGIN_ATTEMPTS = 5;

  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || "/";

  console.log(
    "Login component mounted with redirect path:",
    from,
    "Full location state:",
    location.state
  );

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear Validation error for this field
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

    if (!credentials.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = "Email is invalid";
    }

    if (!credentials.password) {
      errors.password = "Password is required";
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
      await login(credentials);
      addNotification("Login successful! Welcome to our store.", "success");
      setShowSuccessAlert(true);

      // Redirect to request page or home after a short delay
      setTimeout(() => {
        console.log("Redirecting to:", from);
        navigate(from, { replace: true });
      }, 1500);
    } catch (error) {
      // Error handling is done in auth context
      console.error("Login error:", error);
    }
  };

  // Calculate lockout time remaining
  const getLockoutTimeRemaining = () => {
    if (!lockoutUntil) return 0;

    const now = Date.now();
    const timeRemaining = lockoutUntil - now;
    if (timeRemaining <= 0) return 0;

    return Math.ceil(timeRemaining / 60000);
  };

  const lockoutMinutes = getLockoutTimeRemaining();

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
            Sign In
          </Typography>

          {showSuccessAlert && (
            <Alert
              severity="success"
              variant="filled"
              sx={{ mb: 2 }}
              onClose={() => setShowSuccessAlert(false)}
            >
              Login successful! Welcome to our store.
            </Alert>
          )}

          {lockoutMinutes > 0 && (
            <Alert severity="warning" icon={<LockClock />} sx={{ mb: 2 }}>
              Account locked. Please try again in {lockoutMinutes} minute
              {lockoutMinutes > 1 ? "s" : ""}.
            </Alert>
          )}

          {error && lockoutMinutes === 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {loginAttempts > 0 && lockoutMinutes === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {MAX_LOGIN_ATTEMPTS - loginAttempts} attempt
              {MAX_LOGIN_ATTEMPTS - loginAttempts !== 1 ? "s" : ""} remaining
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={credentials.email}
              onChange={handleInputChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              disabled={isLoading || lockoutMinutes > 0}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleInputChange}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              disabled={isLoading || lockoutMinutes > 0}
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading || lockoutMinutes > 0}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
            <Box textAlign="center" sx={{ mb: 2 }}>
              <Typography variant="body1">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  state={{ from: location.state?.from }}
                  style={{ textDecoration: "none", fontWeight: "bold" }}
                >
                  Sign up now
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
