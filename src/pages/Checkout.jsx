import React, { useState, useCallback, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { useOrder } from "../contexts/OrderContext";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import CheckoutStepper from "../components/CheckoutStepper";
import AddressForm from "../components/AddressForm";
import PaymentForm from "../components/PaymentForm";
import OrderSummary from "../components/OrderSummary";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const {
    checkoutStep,
    setCheckoutStep,
    setShippingAddress,
    setBillingAddress,
    setPaymentMethod,
    createOrder,
    shippingAddress,
    billingAddress,
    paymentMethod,
    isLoading: orderLoading,
    error: orderError,
  } = useOrder();
  const { items, total, itemCount, isLoading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Log important state for debugging
  useEffect(() => {
    console.log("Checkout component mounted");
    console.log("Authentication status:", isAuthenticated);
    console.log("Cart items:", items);
    console.log("Cart total:", total);
    console.log("Cart item count:", itemCount);
  }, [isAuthenticated, items, total, itemCount]);

  // Redirect if cart is empty
  useEffect(() => {
    console.log("Cart loading status:", cartLoading);
    console.log("Items in cart on checkout page:", items);

    if (!cartLoading && (!items || items.length === 0)) {
      console.log("Cart is empty, redirecting to catalog");
      navigate("/catalog");
    }
  }, [cartLoading, items, navigate]);

  const [localShippingAddress, setLocalShippingAddress] = useState(
    shippingAddress || {}
  );
  const [localBillingAddress, setLocalBillingAddress] = useState(
    billingAddress || {}
  );
  const [localPaymentMethod, setLocalPaymentMethod] = useState(
    paymentMethod || ""
  );

  // useCallback: handleNext function ko memoize karta hai
  const handleNext = useCallback(() => {
    if (checkoutStep === 0 && !localShippingAddress) {
      // Validate shipping address
      return;
    }

    if (checkoutStep === 1 && !localBillingAddress) {
      // Validate billing address
      return;
    }

    if (checkoutStep === 2 && !localPaymentMethod) {
      // Validate payment method
      return;
    }

    // Save step data
    if (checkoutStep === 0) {
      setShippingAddress(localShippingAddress);
    } else if (checkoutStep === 1) {
      setBillingAddress(localBillingAddress);
    } else if (checkoutStep === 2) {
      setPaymentMethod(localPaymentMethod);
    }

    setCheckoutStep(checkoutStep + 1);
  }, [
    checkoutStep,
    localShippingAddress,
    localBillingAddress,
    localPaymentMethod,
    setShippingAddress,
    setBillingAddress,
    setPaymentMethod,
    setCheckoutStep,
  ]);

  // useCallback: handleBack function ko memoize karta hai
  const handleBack = useCallback(() => {
    setCheckoutStep(checkoutStep - 1);
  }, [checkoutStep, setCheckoutStep]);

  // useCallback: handlePlaceOrder function ko memoize karta hai
  const handlePlaceOrder = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log("Placing order with data:", {
        shippingAddress: localShippingAddress,
        billingAddress: localBillingAddress,
        paymentMethod: localPaymentMethod,
      });

      const orderData = {
        shippingAddress: JSON.stringify(localShippingAddress),
        billingAddress: JSON.stringify(localBillingAddress),
        paymentMethod: localPaymentMethod,
      };

      await createOrder(orderData);
      setCheckoutStep(3); // Success step
    } catch (error) {
      console.error("Failed to place order:", error);
      setError(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [
    localShippingAddress,
    localBillingAddress,
    localPaymentMethod,
    createOrder,
    setCheckoutStep,
  ]);

  // Render current step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            <AddressForm
              initialValues={localShippingAddress}
              onAddressChange={setLocalShippingAddress}
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Billing Address
            </Typography>
            <AddressForm
              initialValues={localBillingAddress}
              onAddressChange={setLocalBillingAddress}
              useSameAsBilling={true}
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Method
            </Typography>
            <PaymentForm
              selectedMethod={localPaymentMethod}
              onMethodChange={setLocalPaymentMethod}
            />
          </Box>
        );
      case 3:
        return (
          <Box textAlign="center">
            <Typography variant="h4" gutterBottom color="primary">
              Thank You for Your Order!
            </Typography>
            <Typography variant="body1">
              Your order has been placed successfully. You will receive a
              confirmation email shortly.
            </Typography>
            <Button variant="contained" sx={{ mt: 3 }} href="/orders">
              View Order History
            </Button>
          </Box>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  // If still loading cart data, show loading indicator
  if (cartLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading cart data...
        </Typography>
      </Container>
    );
  }

  // If there's an error, show error message
  if (error || orderError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || orderError}
        </Alert>
        <Button variant="contained" href="/catalog">
          Return to Catalog
        </Button>
      </Container>
    );
  }

  if (itemCount === 0 && checkoutStep < 3) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Add some items to your cart before proceeding to checkout.
          </Typography>
          <Button variant="contained" href="/">
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {isProcessing && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h4" component="h1" gutterBottom>
        Checkout
      </Typography>

      <CheckoutStepper activeStep={checkoutStep} />

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Main content - left side */}
          <Paper sx={{ p: 3, mb: 3 }}>
            {renderStepContent(checkoutStep)}

            {checkoutStep < 3 && (
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
              >
                <Button
                  onClick={handleBack}
                  disabled={checkoutStep === 0}
                  startIcon={<ArrowBack />}
                >
                  Back
                </Button>

                {checkoutStep < 2 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForward />}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Place Order"}
                  </Button>
                )}
              </Box>
            )}
          </Paper>

          {/* Cart Items Section - only show on first two steps */}
          {checkoutStep < 2 && items && items.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Items in Your Cart
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {items.map((item) => (
                <Box key={item.id}>
                  <Box display="flex" alignItems="center" py={2}>
                    {/* Product Image */}
                    <Box
                      component="img"
                      src={item.image || "https://via.placeholder.com/64"}
                      alt={item.name}
                      sx={{
                        width: 64,
                        height: 64,
                        mr: 2,
                        objectFit: "cover",
                        borderRadius: 1,
                      }}
                    />

                    {/* Product Details */}
                    <Box flexGrow={1}>
                      <Typography variant="subtitle1">{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {item.quantity} × ${item.price?.toFixed(2)}
                      </Typography>
                    </Box>

                    {/* Total Price */}
                    <Typography
                      variant="subtitle1"
                      sx={{ minWidth: 80, textAlign: "right" }}
                    >
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                  <Divider />
                </Box>
              ))}
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Order Summary - right side */}
          <Paper sx={{ p: 3, position: "sticky", top: 20 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />

            <OrderSummary items={items} total={total} />

            {checkoutStep === 2 && (
              <Box mt={3}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Please review your order before placing it. Once confirmed,
                  your order will be processed.
                </Alert>
              </Box>
            )}

            {checkoutStep < 2 && (
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 3 }}
                onClick={handleNext}
                endIcon={<ArrowForward />}
              >
                Continue to {checkoutStep === 0 ? "Billing" : "Payment"}
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;
