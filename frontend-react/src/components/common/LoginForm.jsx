import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { validators, compose } from '../../utils/validators';
import './LoginForm.scss';

/**
 * LOGIN COMPONENT CONVERSION EXAMPLE
 *
 * Angular Version (TypeScript + Template):
 * ========================================
 * export class LoginComponent implements OnInit {
 *   loginForm: FormGroup;
 *   isLoading = false;
 *   error: string | null = null;
 *
 *   constructor(
 *     private fb: FormBuilder,
 *     private authService: AuthService,
 *     private router: Router
 *   ) {}
 *
 *   ngOnInit() {
 *     this.loginForm = this.fb.group({
 *       email: ['', [Validators.required, Validators.email]],
 *       password: ['', [Validators.required, Validators.minLength(8)]]
 *     });
 *   }
 *
 *   onSubmit() {
 *     this.isLoading = true;
 *     this.authService.login(
 *       this.loginForm.value.email,
 *       this.loginForm.value.password
 *     ).subscribe({
 *       next: (response) => {
 *         this.router.navigate(['/dashboard']);
 *       },
 *       error: (err) => {
 *         this.error = err.message;
 *         this.isLoading = false;
 *       }
 *     });
 *   }
 * }
 *
 * React Version (JavaScript + Hooks):
 * ===================================
 * Uses:
 * - useForm custom hook (replaces FormBuilder)
 * - useAuth context (replaces Dependency Injection)
 * - useNavigate hook (replaces Router)
 * - Controlled components (replaces Template-driven forms)
 */
function LoginForm() {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  const [apiError, setApiError] = useState(null);

  // Form validation schema
  const validationSchema = {
    email: compose([validators.required, validators.email]),
    password: compose([validators.required, validators.minLength(8)]),
  };

  // useForm hook replaces FormBuilder + FormControl
  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } = useForm(
    {
      email: '',
      password: '',
    },
    async (formValues) => {
      try {
        setApiError(null);
        await login(formValues.email, formValues.password);
        navigate('/dashboard');
      } catch (err) {
        setApiError(err.message || 'Login failed');
      }
    },
    (values) => validateFormValues(values)
  );

  function validateFormValues(values) {
    const fieldErrors = {};
    Object.keys(validationSchema).forEach((field) => {
      const error = validationSchema[field](values[field] || '');
      if (error) {
        fieldErrors[field] = error;
      }
    });
    return fieldErrors;
  }

  const displayError = apiError || authError;

  return (
    <div className="login-form-container">
      <div className="login-card">
        <h1>SkillSync Login</h1>

        {displayError && <div className="alert alert-error">{displayError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
              disabled={isSubmitting}
              autoComplete="email"
            />
            {errors.email && touched.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
              disabled={isSubmitting}
              autoComplete="current-password"
            />
            {errors.password && touched.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="form-footer">
          <p>
            Don't have an account? <a href="/register">Register here</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
