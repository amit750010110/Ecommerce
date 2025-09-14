import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Grid,
  Chip,
} from "@mui/material";
import { LocalShipping, CheckCircleOutline } from "@mui/icons-material";

export default function OrderSummary({ items, total, showDetails = true }) {
  // Calculate subtotal (without tax and shipping)
  const subtotal = total || 0;

  // Calculate tax (assuming 8% tax rate)
  const taxRate = 0.08;
  const tax = subtotal * taxRate;

  // Calculate shipping (free shipping over $50, otherwise $5.99)
  const shipping = subtotal > 50 ? 0 : 5.99;

  // Calculate grand total
  const grandTotal = subtotal + tax + shipping;

  // Count total number of items
  const totalItems = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <Box>
      {showDetails && items && items.length > 0 && (
        <>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {totalItems} {totalItems === 1 ? "item" : "items"} in cart
          </Typography>

          <List
            disablePadding
            sx={{ maxHeight: 200, overflowY: "auto", mb: 2 }}
          >
            {items.map((item) => (
              <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight="medium" noWrap>
                      {item.name}
                    </Typography>
                  }
                  secondary={`Qty: ${item.quantity}`}
                  primaryTypographyProps={{ style: { maxWidth: "150px" } }}
                />
                <Typography variant="body2" fontWeight="medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </Typography>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
        </>
      )}

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body2">Subtotal</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" align="right" fontWeight="medium">
            ${subtotal.toFixed(2)}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2">Tax (8%)</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" align="right">
            ${tax.toFixed(2)}
          </Typography>
        </Grid>

        <Grid item xs={6} sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body2">Shipping</Typography>
          {shipping === 0 && (
            <Chip
              size="small"
              label="FREE"
              color="success"
              icon={<CheckCircleOutline fontSize="small" />}
              sx={{ ml: 1, height: 20 }}
            />
          )}
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" align="right">
            {shipping === 0 ? "$0.00" : `$${shipping.toFixed(2)}`}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>

        <Grid item xs={6}>
          <Typography variant="h6">Total</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h6" align="right" color="primary">
            ${grandTotal.toFixed(2)}
          </Typography>
        </Grid>

        {shipping === 0 && (
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <LocalShipping color="primary" fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2" color="primary">
                Eligible for FREE shipping
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
