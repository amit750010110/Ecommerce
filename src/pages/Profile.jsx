import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Person, Email, Badge, Refresh, Logout } from "@mui/icons-material";
import { useUser } from "../contexts/UserContext";
import { useAuth } from "../contexts/AuthContext";
import ProfileForm from "../components/ProfileForm";

const Profile = () => {
  const { profile, fullName, isLoading, error, fetchProfile } = useUser();
  const { isAuthenticated, logout } = useAuth();
  const [loadAttempts, setLoadAttempts] = useState(0);
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/profile" } } });
    }
  }, [isAuthenticated, navigate]);

  // Effect to log profile data for debugging
  useEffect(() => {
    console.log("Profile component rendered with profile:", profile);
    console.log("Authentication status:", isAuthenticated);
  }, [profile, isAuthenticated]);

  // Effect to retry loading profile if authenticated but no profile
  useEffect(() => {
    if (isAuthenticated && !profile && !isLoading && loadAttempts < 3) {
      console.log(`Retry loading profile attempt ${loadAttempts + 1}`);
      const timer = setTimeout(() => {
        fetchProfile();
        setLoadAttempts((prev) => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, profile, isLoading, loadAttempts, fetchProfile]);

  // Handle refresh button click
  const handleRefresh = () => {
    setLoadAttempts(0); // Reset attempts counter
    fetchProfile();
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setLoadAttempts(0); // Reset attempts counter
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="300px"
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading profile...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error && isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="300px"
        >
          <Typography variant="h6" color="error" gutterBottom>
            Error loading profile: {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{ mr: 1 }}
          >
            Refresh Profile
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Logout />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <ProfileForm />
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Badge sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body1">{profile?.id}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Person sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1">{fullName}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Email sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body1">{profile?.email}</Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Roles
                </Typography>
                <Box>
                  {profile?.roles?.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      size="small"
                      color={role === "ADMIN" ? "primary" : "default"}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Debug Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Authentication Status
                </Typography>
                <Typography variant="body1">
                  {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                </Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Profile Loaded
                </Typography>
                <Typography variant="body1">
                  {profile ? "Yes" : "No"}
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => console.log("Current profile:", profile)}
                >
                  Log Profile to Console
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
