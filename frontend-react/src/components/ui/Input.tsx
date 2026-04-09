import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, leftIcon, rightIcon, error, containerClassName = '', className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4
              text-xs font-bold text-slate-900 outline-none transition-all
              placeholder:text-slate-400 placeholder:font-medium
              focus:ring-4 focus:ring-indigo-50 focus:border-indigo-100 focus:bg-white
              ${leftIcon ? 'pl-11' : ''}
              ${rightIcon ? 'pr-11' : ''}
              ${error ? 'border-rose-200 focus:ring-rose-50 focus:border-rose-300' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
