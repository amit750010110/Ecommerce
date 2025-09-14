import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
} from "@mui/material";
import { Add, Edit, Delete, Home, Business } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import AddressForm from "../components/AddressForm";
import { httpService } from "../services/http";

const AddressBook = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [addressType, setAddressType] = useState("shipping"); // 'shipping' or 'billing'

  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotification();

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const response = await httpService.get("/users/addresses");
      setAddresses(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
      setError("Failed to load addresses. Please try again later.");
      addNotification("Failed to load addresses", "error");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, addNotification]);

  // Load addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Handle dialog open for adding new address
  const handleAddAddress = (type) => {
    setCurrentAddress(null);
    setAddressType(type);
    setOpenDialog(true);
  };

  // Handle dialog open for editing existing address
  const handleEditAddress = (address) => {
    setCurrentAddress(address);
    setAddressType(address.type);
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentAddress(null);
  };

  // Handle address save (create or update)
  const handleSaveAddress = async (addressData) => {
    try {
      setLoading(true);

      const formattedAddress = {
        ...addressData,
        type: addressType,
      };

      if (currentAddress) {
        // Update existing address
        await httpService.put(
          `/users/addresses/${currentAddress.id}`,
          formattedAddress
        );
        addNotification("Address updated successfully", "success");
      } else {
        // Create new address
        await httpService.post("/users/addresses", formattedAddress);
        addNotification("Address added successfully", "success");
      }

      // Refresh address list
      fetchAddresses();
      handleCloseDialog();
    } catch (err) {
      console.error("Failed to save address:", err);
      addNotification("Failed to save address", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle address delete
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;

    try {
      setLoading(true);
      await httpService.delete(`/users/addresses/${addressId}`);
      addNotification("Address deleted successfully", "success");

      // Refresh address list
      fetchAddresses();
    } catch (err) {
      console.error("Failed to delete address:", err);
      addNotification("Failed to delete address", "error");
    } finally {
      setLoading(false);
    }
  };

  // Render address card
  const renderAddressCard = (address) => {
    return (
      <Card key={address.id} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            {address.type === "shipping" ? (
              <Home color="primary" sx={{ mr: 1 }} />
            ) : (
              <Business color="secondary" sx={{ mr: 1 }} />
            )}
            <Typography variant="h6">
              {address.type === "shipping" ? "Shipping" : "Billing"} Address
            </Typography>
          </Box>

          <Typography variant="body1">
            {address.firstName} {address.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {address.street}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {address.city}, {address.state} {address.zipCode}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {address.country}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            startIcon={<Edit />}
            size="small"
            onClick={() => handleEditAddress(address)}
          >
            Edit
          </Button>
          <Button
            startIcon={<Delete />}
            size="small"
            color="error"
            onClick={() => handleDeleteAddress(address.id)}
          >
            Delete
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Address Book
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h5">Shipping Addresses</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleAddAddress("shipping")}
              >
                Add
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {loading ? (
              <Typography>Loading addresses...</Typography>
            ) : addresses.filter((a) => a.type === "shipping").length === 0 ? (
              <Typography color="text.secondary">
                No shipping addresses saved yet.
              </Typography>
            ) : (
              addresses
                .filter((address) => address.type === "shipping")
                .map(renderAddressCard)
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h5">Billing Addresses</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleAddAddress("billing")}
              >
                Add
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {loading ? (
              <Typography>Loading addresses...</Typography>
            ) : addresses.filter((a) => a.type === "billing").length === 0 ? (
              <Typography color="text.secondary">
                No billing addresses saved yet.
              </Typography>
            ) : (
              addresses
                .filter((address) => address.type === "billing")
                .map(renderAddressCard)
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Address Form Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentAddress ? "Edit Address" : "Add New Address"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              {addressType === "shipping" ? "Shipping" : "Billing"} Address
              Details
            </Typography>
            <AddressForm
              initialValues={currentAddress || {}}
              onAddressChange={handleSaveAddress}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              const formElement = document.querySelector("form");
              if (formElement) {
                formElement.dispatchEvent(
                  new Event("submit", { bubbles: true })
                );
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AddressBook;
