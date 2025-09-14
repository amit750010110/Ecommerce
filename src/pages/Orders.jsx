import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  CancelOutlined,
  ReceiptLong,
  ExpandMore,
  ExpandLess,
  LocalShipping,
} from "@mui/icons-material";
import { useOrder } from "../contexts/OrderContext";
import { useNotification } from "../contexts/NotificationContext";

// Helper function to format date
const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "warning";
    case "processing":
      return "info";
    case "shipped":
      return "primary";
    case "delivered":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

const Orders = () => {
  const { orders, isLoading, error, fetchOrders, cancelOrder } = useOrder();
  const { addNotification } = useNotification();

  // Ensure orders is always an array
  const orderList = Array.isArray(orders) ? orders : [];
  console.log("Orders in component:", orderList);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Refresh orders on component mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle order selection for dialog
  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  // Handle order cancel
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await cancelOrder(orderId);
      fetchOrders(); // Refresh orders list
    } catch (error) {
      console.error("Error canceling order:", error);
    }
  };

  // Toggle expanded row
  const toggleExpandRow = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Render order status chip
  const renderStatusChip = (status) => (
    <Chip
      label={status.toUpperCase()}
      color={getStatusColor(status)}
      size="small"
    />
  );

  // Render expanded order row
  const renderExpandedRow = (order) => {
    if (expandedOrderId !== order.id) return null;

    return (
      <TableRow>
        <TableCell colSpan={6}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Items
                </Typography>
                <List dense>
                  {order.items.map((item) => (
                    <ListItem key={item.id}>
                      <ListItemText
                        primary={item.product.name}
                        secondary={`Quantity: ${
                          item.quantity
                        } | Price: $${item.product.price.toFixed(2)}`}
                      />
                      <Typography variant="body2">
                        ${(item.quantity * item.product.price).toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Shipping Address
                </Typography>
                <Typography variant="body2">
                  {order.shippingAddress &&
                    JSON.parse(order.shippingAddress).street}
                  , <br />
                  {order.shippingAddress &&
                    JSON.parse(order.shippingAddress).city}
                  ,{" "}
                  {order.shippingAddress &&
                    JSON.parse(order.shippingAddress).state}{" "}
                  {order.shippingAddress &&
                    JSON.parse(order.shippingAddress).zipCode}{" "}
                  <br />
                  {order.shippingAddress &&
                    JSON.parse(order.shippingAddress).country}
                </Typography>

                <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom>
                  Payment Method
                </Typography>
                <Typography variant="body2">
                  {order.paymentMethod === "creditCard" && "Credit Card"}
                  {order.paymentMethod === "bankTransfer" && "Bank Transfer"}
                  {order.paymentMethod === "payOnDelivery" && "Pay on Delivery"}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : orderList.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            You haven't placed any orders yet
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Browse our catalog and add items to your cart to get started.
          </Typography>
          <Button variant="contained" href="/catalog">
            Go to Catalog
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell align="center">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderList.map((order) => [
                <TableRow key={order.id}>
                  <TableCell>#{order.id.substring(0, 8)}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>{renderStatusChip(order.status)}</TableCell>
                  <TableCell>
                    {order.status !== "cancelled" &&
                      order.status !== "delivered" && (
                        <Button
                          startIcon={<CancelOutlined />}
                          size="small"
                          color="error"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    {order.status === "shipped" && (
                      <Button
                        startIcon={<LocalShipping />}
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                        onClick={() =>
                          addNotification(
                            "Tracking information sent to your email!",
                            "info"
                          )
                        }
                      >
                        Track
                      </Button>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => {
                        toggleExpandRow(order.id);
                        if (expandedOrderId !== order.id) {
                          handleSelectOrder(order);
                        }
                      }}
                      aria-label="expand row"
                    >
                      {expandedOrderId === order.id ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>,
                renderExpandedRow(order),
              ])}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Order Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>Order #{selectedOrder.id.substring(0, 8)}</DialogTitle>
            <DialogContent>
              <Typography variant="subtitle1" gutterBottom>
                Order Date: {formatDate(selectedOrder.createdAt)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Status: {renderStatusChip(selectedOrder.status)}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Items
              </Typography>
              <List>
                {selectedOrder.items.map((item) => (
                  <ListItem key={item.id} divider>
                    <ListItemText
                      primary={item.product.name}
                      secondary={`Quantity: ${
                        item.quantity
                      } | Price per unit: $${item.product.price.toFixed(2)}`}
                    />
                    <Typography variant="body1">
                      ${(item.quantity * item.product.price).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Typography variant="h6">
                  Total: ${selectedOrder.total.toFixed(2)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Shipping Address
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body1">
                      {selectedOrder.shippingAddress &&
                        JSON.parse(selectedOrder.shippingAddress)
                          .firstName}{" "}
                      {selectedOrder.shippingAddress &&
                        JSON.parse(selectedOrder.shippingAddress).lastName}
                    </Typography>
                    <Typography variant="body2">
                      {selectedOrder.shippingAddress &&
                        JSON.parse(selectedOrder.shippingAddress).street}
                    </Typography>
                    <Typography variant="body2">
                      {selectedOrder.shippingAddress &&
                        JSON.parse(selectedOrder.shippingAddress).city}
                      ,{" "}
                      {selectedOrder.shippingAddress &&
                        JSON.parse(selectedOrder.shippingAddress).state}{" "}
                      {selectedOrder.shippingAddress &&
                        JSON.parse(selectedOrder.shippingAddress).zipCode}
                    </Typography>
                    <Typography variant="body2">
                      {selectedOrder.shippingAddress &&
                        JSON.parse(selectedOrder.shippingAddress).country}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Payment Information
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body1">
                      Method:{" "}
                      {selectedOrder.paymentMethod === "creditCard" &&
                        "Credit Card"}
                      {selectedOrder.paymentMethod === "bankTransfer" &&
                        "Bank Transfer"}
                      {selectedOrder.paymentMethod === "payOnDelivery" &&
                        "Pay on Delivery"}
                    </Typography>
                    <Typography variant="body2">
                      Status: {selectedOrder.paymentStatus || "Paid"}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {selectedOrder.status === "shipped" && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Tracking Information
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body1">
                      Carrier: {selectedOrder.carrier || "Express Shipping"}
                    </Typography>
                    <Typography variant="body2">
                      Tracking Number:{" "}
                      {selectedOrder.trackingNumber || "TRK12345678"}
                    </Typography>
                    <Typography variant="body2">
                      Estimated Delivery:{" "}
                      {selectedOrder.estimatedDelivery ||
                        formatDate(
                          new Date(new Date().setDate(new Date().getDate() + 3))
                        )}
                    </Typography>
                  </Paper>
                </>
              )}
            </DialogContent>
            <DialogActions>
              {selectedOrder.status !== "cancelled" &&
                selectedOrder.status !== "delivered" && (
                  <Button
                    color="error"
                    onClick={() => {
                      handleCancelOrder(selectedOrder.id);
                      setOpenDialog(false);
                    }}
                  >
                    Cancel Order
                  </Button>
                )}
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              <Button
                variant="contained"
                startIcon={<ReceiptLong />}
                onClick={() =>
                  addNotification(
                    "Invoice has been sent to your email!",
                    "success"
                  )
                }
              >
                Download Invoice
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Orders;
