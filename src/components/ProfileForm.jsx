import React, { useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useForm } from "../hooks/useForm";
import { useUser } from "../contexts/UserContext";

// Profile form validation function
const validateProfile = (values) => {
  const errors = {};

  if (!values.firstName) errors.firstName = "First name is required";
  if (!values.lastName) errors.lastName = "Last name is required";
  if (!values.email) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(values.email))
    errors.email = "Email is invalid";

  return errors;
};

const ProfileForm = () => {
  const { profile, updateProfile, isLoading } = useUser();

  // Initialize form with empty values first
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useForm(
    {
      firstName: "",
      lastName: "",
      email: "",
    },
    validateProfile
  );

  // Update form values when profile is loaded
  useEffect(() => {
    if (profile) {
      console.log("Updating form values with profile:", profile);
      // Set each field individually
      setFieldValue("firstName", profile.firstName || "");
      setFieldValue("lastName", profile.lastName || "");
      setFieldValue("email", profile.email || "");
    }
  }, [profile, setFieldValue]);

  // Handle form submission
  const onSubmit = async (formValues) => {
    console.log("Submitting profile update:", formValues);
    try {
      const updatedProfile = await updateProfile(formValues);
      console.log("Profile updated successfully:", updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  if (isLoading && !profile) {
    return (
      <Paper sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Profile Information
      </Typography>

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit);
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="firstName"
              label="First Name"
              value={values.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.firstName && Boolean(errors.firstName)}
              helperText={touched.firstName && errors.firstName}
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="lastName"
              label="Last Name"
              value={values.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.lastName && Boolean(errors.lastName)}
              helperText={touched.lastName && errors.lastName}
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="email"
              label="Email Address"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
              disabled={isLoading}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || isSubmitting}
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProfileForm;
