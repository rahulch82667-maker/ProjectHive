'use client';

import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helpText, required, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={props.id} className="text-sm font-medium text-slate-700">
            {label}
            {required && <span className="ml-1 text-rose-600">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 ${
            error ? 'border-rose-500' : ''
          } ${className || ''}`}
          {...props}
        />
        {error && <p className="text-xs text-rose-600">{error}</p>}
        {helpText && !error && <p className="text-xs text-slate-500">{helpText}</p>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
