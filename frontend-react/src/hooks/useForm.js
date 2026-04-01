import { useState, useCallback } from 'react';

/**
 * Custom Hook: useForm
 * Replaces Angular's Reactive Forms and Template-driven Forms
 *
 * Angular pattern (Reactive Forms):
 * this.form = this.fb.group({
 *   email: ['', [Validators.required, Validators.email]],
 *   password: ['', [Validators.required, Validators.minLength(8)]]
 * });
 *
 * React pattern (Controlled Components with Custom Hook):
 * const { values, errors, handleChange, handleSubmit } = useForm(...);
 */
export function useForm(initialValues = {}, onSubmit, validate = null) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback(() => {
    if (!validate) return {};

    const newErrors = validate(values);
    setErrors(newErrors);
    return newErrors;
  }, [values, validate]);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === 'checkbox' ? checked : value;

      setValues((prev) => ({
        ...prev,
        [name]: fieldValue,
      }));

      // Clear error for this field on change
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const formErrors = validateForm();

      if (Object.keys(formErrors).length === 0) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (err) {
          console.error('Form submission error:', err);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [validateForm, onSubmit, values]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
  };
}
