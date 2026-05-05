import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`flex flex-col w-full ${className}`}>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 text-sm font-medium text-text-main">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-text-main transition-colors
              focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand
              placeholder:text-text-muted/60
              ${leftIcon ? 'pl-10' : ''}
              ${error ? 'border-danger focus:ring-danger/50 focus:border-danger' : 'border-border'}
              ${props.disabled ? 'opacity-60 cursor-not-allowed bg-surface-hover' : ''}
            `}
            {...props}
          />
        </div>
        {(error || helperText) && (
          <p className={`mt-1.5 text-xs ${error ? 'text-danger' : 'text-text-muted'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
