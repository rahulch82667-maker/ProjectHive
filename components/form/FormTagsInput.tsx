'use client';

import React, { useState } from 'react';

interface FormTagsInputProps {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export const FormTagsInput: React.FC<FormTagsInputProps> = ({
  label,
  error,
  helpText,
  required,
  value,
  onChange,
  placeholder = 'Type and press Enter to add a tag',
  maxTags = 10,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (value.length < maxTags && !value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
        setInputValue('');
      }
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-1 text-rose-600">*</span>}
        </label>
      )}
      <div
        className={`rounded-lg border p-3 ${error ? 'border-rose-500' : 'border-slate-200'}`}
      >
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((tag, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-900"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="text-amber-700 hover:text-amber-900"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={value.length >= maxTags}
          className="w-full text-sm outline-none bg-transparent"
        />
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      {helpText && !error && (
        <p className="text-xs text-slate-500">
          {helpText} ({value.length}/{maxTags})
        </p>
      )}
    </div>
  );
};
