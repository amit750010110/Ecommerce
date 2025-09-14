import React, { useState } from "react";
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Grid,
  Paper,
  Divider,
  InputAdornment,
  Alert,
} from "@mui/material";
import {
  CreditCard,
  AccountBalance,
  PaymentOutlined,
  LockOutlined,
  SecurityOutlined,
} from "@mui/icons-material";

export default function PaymentForm({ selectedMethod, onMethodChange }) {
  const [cardNumber, setCardNumber] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  // Handle payment method change
  const handleMethodChange = (event) => {
    onMethodChange(event.target.value);
  };

  // Format card number with spaces
  const handleCardNumberChange = (event) => {
    const value = event.target.value
      .replace(/\s+/g, "")
      .replace(/[^0-9]/gi, "");
    const formattedValue =
      value
        .replace(/\s/g, "")
        .match(/.{1,4}/g)
        ?.join(" ") || "";

    setCardNumber(formattedValue);
  };

  // Format expiry date as MM/YY
  const handleExpiryDateChange = (event) => {
    const value = event.target.value
      .replace(/\s+/g, "")
      .replace(/[^0-9]/gi, "");

    if (value.length <= 2) {
      setExpiryDate(value);
    } else {
      setExpiryDate(`${value.substring(0, 2)}/${value.substring(2, 4)}`);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <LockOutlined color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" color="primary">
          Secure Payment Options
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Please select your preferred payment method. Your payment information is
        protected.
      </Alert>

      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          name="paymentMethod"
          value={selectedMethod}
          onChange={handleMethodChange}
        >
          <Paper
            variant="outlined"
            sx={{
              mb: 2,
              p: 2,
              mt: 2,
              borderColor:
                selectedMethod === "creditCard" ? "primary.main" : "inherit",
            }}
          >
            <FormControlLabel
              value="creditCard"
              control={<Radio color="primary" />}
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CreditCard sx={{ mr: 1 }} />
                  <Typography>Credit/Debit Card</Typography>
                </Box>
              }
            />

            {selectedMethod === "creditCard" && (
              <Grid container spacing={2} sx={{ mt: 1, pl: 4 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Card Number"
                    fullWidth
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    inputProps={{ maxLength: 19 }}
                    placeholder="1234 5678 9012 3456"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCard />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Name on Card"
                    fullWidth
                    value={nameOnCard}
                    onChange={(e) => setNameOnCard(e.target.value)}
                    placeholder="John Smith"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Expiry Date"
                    fullWidth
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    placeholder="MM/YY"
                    inputProps={{ maxLength: 5 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="CVV"
                    fullWidth
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    inputProps={{ maxLength: 3 }}
                    type="password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SecurityOutlined fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            )}
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              mb: 2,
              p: 2,
              borderColor:
                selectedMethod === "bankTransfer" ? "primary.main" : "inherit",
            }}
          >
            <FormControlLabel
              value="bankTransfer"
              control={<Radio color="primary" />}
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <AccountBalance sx={{ mr: 1 }} />
                  <Typography>Bank Transfer</Typography>
                </Box>
              }
            />

            {selectedMethod === "bankTransfer" && (
              <Box sx={{ mt: 1, pl: 4 }}>
                <Typography variant="body2" color="textSecondary">
                  Please transfer the payment to the following bank account:
                </Typography>
                <Typography variant="body2" mt={1}>
                  Bank: ACME Bank
                  <br />
                  Account Number: 1234567890
                  <br />
                  Routing Number: 987654321
                  <br />
                  Account Name: ECommerce Inc.
                </Typography>
                <Typography variant="body2" color="textSecondary" mt={1}>
                  Your order will be processed once the payment is confirmed.
                </Typography>
              </Box>
            )}
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              mb: 2,
              p: 2,
              borderColor:
                selectedMethod === "payOnDelivery" ? "primary.main" : "inherit",
            }}
          >
            <FormControlLabel
              value="payOnDelivery"
              control={<Radio color="primary" />}
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PaymentOutlined sx={{ mr: 1 }} />
                  <Typography>Pay on Delivery</Typography>
                </Box>
              }
            />

            {selectedMethod === "payOnDelivery" && (
              <Box sx={{ mt: 1, pl: 4 }}>
                <Typography variant="body2" color="textSecondary">
                  You can pay with cash or card when your order is delivered.
                </Typography>
                <Typography variant="body2" color="error" mt={1}>
                  Note: Additional fees may apply for cash on delivery.
                </Typography>
              </Box>
            )}
          </Paper>
        </RadioGroup>
      </FormControl>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <LockOutlined
          fontSize="small"
          sx={{ mr: 1, color: "text.secondary" }}
        />
        <Typography variant="body2" color="textSecondary">
          Your payment information is secure and encrypted. We do not store your
          card details.
        </Typography>
      </Box>
    </Box>
  );
}
