import React from "react";
import { Stepper, Step, StepLabel, Box } from "@mui/material";
import {
  ShoppingCart,
  LocalShipping,
  Payment,
  Done,
} from "@mui/icons-material";

const steps = [
  { label: "Cart", icon: <ShoppingCart /> },
  { label: "Shipping", icon: <LocalShipping /> },
  { label: "Payment", icon: <Payment /> },
  { label: "Confirmation", icon: <Done /> },
];

const CheckoutStepper = ({ activeStep }) => {
  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel icon={step.icon}>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default CheckoutStepper;
