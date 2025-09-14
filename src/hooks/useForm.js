import { useState, useCallback } from 'react';

// Custom hook for form management
// useForm: form state, validation, aur submission handling ko manage karta hai
export const useForm = (initialValues = {}, validateFn = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useCallback: handleChange function ko memoize karta hai
  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;

    setValues(prevValues => ({
      ...prevValues,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when field changes
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  }, [errors]);

  // useCallback: handleBlur function ko memoize karta hai
  const handleBlur = useCallback((event) => {
    const { name } = event.target;

    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));

    // Validate field on blur
    if (validateFn) {
      const fieldErrors = validateFn(values);
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: fieldErrors[name] || ''
      }));
    }
  }, [validateFn, values]);

  // useCallback: setFieldValue function ko memoize karta hai
  const setFieldValue = useCallback((name, value) => {
    setValues(prevValues => ({
      ...prevValues,
      [name]: value
    }));
  }, []);

  // useCallback: validateForm function ko memoize karta hai
  const validateForm = useCallback(() => {
    if (!validateFn) return true;

    const newErrors = validateFn(values);
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }, [validateFn, values]);

  // useCallback: handleSubmit function ko memoize karta hai
  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);

    // Validate form
    const isValid = validateForm();

    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, values]);

  // useCallback: resetForm function ko memoize karta hai
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    setFieldValue,
    handleSubmit,
    resetForm
  };
};