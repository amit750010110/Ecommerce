import React from 'react';
import {
  Box,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useForm } from '../hooks/useForm';

// Address form validation function
const validateAddress = (values) => {
  const errors = {};
  
  if (!values.firstName) errors.firstName = 'First name is required';
  if (!values.lastName) errors.lastName = 'Last name is required';
  if (!values.street) errors.street = 'Street address is required';
  if (!values.city) errors.city = 'City is required';
  if (!values.state) errors.state = 'State is required';
  if (!values.zipCode) errors.zipCode = 'ZIP code is required';
  if (!values.country) errors.country = 'Country is required';
  
  return errors;
};

const AddressForm = ({ initialValues = {}, onAddressChange, useSameAsBilling = false }) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue
  } = useForm(initialValues, validateAddress);

  // useEffect: values change pe parent component ko notify karta hai
  React.useEffect(() => {
    if (onAddressChange) {
      onAddressChange(values);
    }
  }, [values, onAddressChange]);

  // Handle checkbox change
  const handleCheckboxChange = (event) => {
    setFieldValue('useSameAsBilling', event.target.checked);
  };

  return (
    <Box component="form">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="firstName"
            label="First Name"
            value={values.firstName || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.firstName && Boolean(errors.firstName)}
            helperText={touched.firstName && errors.firstName}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="lastName"
            label="Last Name"
            value={values.lastName || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.lastName && Boolean(errors.lastName)}
            helperText={touched.lastName && errors.lastName}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="street"
            label="Street Address"
            value={values.street || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.street && Boolean(errors.street)}
            helperText={touched.street && errors.street}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="city"
            label="City"
            value={values.city || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.city && Boolean(errors.city)}
            helperText={touched.city && errors.city}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="state"
            label="State/Province"
            value={values.state || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.state && Boolean(errors.state)}
            helperText={touched.state && errors.state}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="zipCode"
            label="ZIP / Postal Code"
            value={values.zipCode || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.zipCode && Boolean(errors.zipCode)}
            helperText={touched.zipCode && errors.zipCode}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="country"
            label="Country"
            value={values.country || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.country && Boolean(errors.country)}
            helperText={touched.country && errors.country}
          />
        </Grid>
        {useSameAsBilling && (
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="useSameAsBilling"
                  checked={values.useSameAsBilling || false}
                  onChange={handleCheckboxChange}
                />
              }
              label="Use same address for billing"
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AddressForm;