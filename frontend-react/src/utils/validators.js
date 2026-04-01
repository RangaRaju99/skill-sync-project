/**
 * Validation Utilities
 * Replaces Angular's built-in Validators
 *
 * Angular pattern:
 * Validators.required, Validators.email, Validators.minLength(8)
 *
 * React pattern:
 * validateEmail(), validatePassword(), validateRequired()
 */

export const validators = {
  /**
   * Validate required field
   */
  required: (value) => {
    if (typeof value === 'string') {
      return value.trim() === '' ? 'This field is required' : null;
    }
    return !value ? 'This field is required' : null;
  },

  /**
   * Validate email format
   */
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? 'Invalid email address' : null;
  },

  /**
   * Validate minimum length
   */
  minLength: (min) => (value) => {
    return value.length < min ? `Minimum length is ${min} characters` : null;
  },

  /**
   * Validate maximum length
   */
  maxLength: (max) => (value) => {
    return value.length > max ? `Maximum length is ${max} characters` : null;
  },

  /**
   * Validate password strength
   */
  password: (value) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(value)) {
      return 'Password must contain uppercase, lowercase, number, and special character';
    }
    return null;
  },

  /**
   * Validate phone number
   */
  phone: (value) => {
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    return !phoneRegex.test(value) ? 'Invalid phone number' : null;
  },

  /**
   * Validate URL
   */
  url: (value) => {
    try {
      new URL(value);
      return null;
    } catch {
      return 'Invalid URL';
    }
  },

  /**
   * Custom pattern validation
   */
  pattern: (pattern, message) => (value) => {
    const regex = new RegExp(pattern);
    return !regex.test(value) ? message : null;
  },
};

/**
 * Compose multiple validators
 * Usage: compose([validators.required, validators.email])(value)
 */
export function compose(validatorFns) {
  return (value) => {
    for (const validator of validatorFns) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
}

/**
 * Form validation helper
 * Validates entire form object
 */
export function validateForm(formValues, schema) {
  const errors = {};

  Object.keys(schema).forEach((field) => {
    const validator = schema[field];
    const error = validator(formValues[field] || '');
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}
