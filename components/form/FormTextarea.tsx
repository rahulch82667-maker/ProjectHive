'use client';

import React from 'react';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  charLimit?: number;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, helpText, required, charLimit, className, value, onChange, ...props }, ref) => {
    const charCount = value ? String(value).length : 0;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={props.id} className="text-sm font-medium text-slate-700">
            {label}
            {required && <span className="ml-1 text-rose-600">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          className={`rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 ${
            error ? 'border-rose-500' : ''
          } ${className || ''}`}
          {...props}
        />
        <div className="flex justify-between text-xs">
          <div>
            {error && <p className="text-rose-600">{error}</p>}
            {helpText && !error && <p className="text-slate-500">{helpText}</p>}
          </div>
          {charLimit && <p className="text-slate-500">{charCount}/{charLimit}</p>}
        </div>
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
