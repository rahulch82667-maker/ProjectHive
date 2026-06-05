'use client';

import React, { useCallback, useState, useId } from 'react';
import { Folder } from 'lucide-react';
import { uploadToCloudinary, CloudinaryUploadResponse } from '@/services/cloudinary.service';

interface FormFileUploadProps {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  onChange: (files: CloudinaryUploadResponse | CloudinaryUploadResponse[]) => void;
  disabled?: boolean;
  uploading?: boolean;
  folder?: string;
  resourceType?: 'auto' | 'image' | 'video';
}

export const FormFileUpload: React.FC<FormFileUploadProps> = ({
  label,
  error,
  helpText,
  required,
  multiple = false,
  accept = 'image/*',
  maxSize,
  onChange,
  disabled = false,
  uploading = false,
  folder = 'projecthive',
  resourceType = 'auto',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [internalUploading, setInternalUploading] = useState(false);
  const fileInputId = useId();

  const isUploading = uploading || internalUploading;
  const effectiveMaxSize = maxSize ?? (resourceType === 'video' ? 100 : 10);

  const handleUpload = useCallback(
    async (files: File[]) => {
      setUploadError(null);

      const validFiles = files.filter((file) => {
        const sizeInMB = file.size / (1024 * 1024);
        if (sizeInMB > effectiveMaxSize) {
          const message = `File ${file.name} exceeds max size of ${effectiveMaxSize}MB`;
          console.error(message);
          setUploadError(message);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        return;
      }

      setInternalUploading(true);
      try {
        if (multiple) {
          const uploadPromises = validFiles.map((file) =>
            uploadToCloudinary(file, { folder, resource_type: resourceType })
          );
          const results = await Promise.all(uploadPromises);
          onChange(results);
        } else {
          const result = await uploadToCloudinary(validFiles[0], {
            folder,
            resource_type: resourceType,
          });
          onChange(result);
        }
      } catch (error: any) {
        const message = error?.message || 'Upload failed';
        console.error('Upload failed:', error);
        setUploadError(message);
      } finally {
        setInternalUploading(false);
      }
    },
    [multiple, onChange, effectiveMaxSize, folder, resourceType]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUpload(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleUpload(Array.from(e.dataTransfer.files));
    }
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
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition ${
          isDragging
            ? 'border-amber-500 bg-amber-50'
            : error
              ? 'border-rose-300 bg-rose-50'
              : 'border-slate-300 bg-slate-50'
        } ${isUploading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInputChange}
          disabled={isUploading || disabled}
          className="hidden"
          id={fileInputId}
        />
        <label htmlFor={fileInputId} className="cursor-pointer">
          <div className="space-y-2">
            <div className="flex justify-center">
              <Folder className="h-12 w-12 text-slate-400" />
            </div>
            {isUploading ? (
              <div>
                <p className="font-medium text-slate-700">Uploading...</p>
              </div>
            ) : (
              <>
                <p className="font-medium text-slate-700">
                  Drag and drop {multiple ? 'files' : 'a file'} here
                </p>
                <p className="text-xs text-slate-500">or click to browse</p>
              </>
            )}
          </div>
        </label>
      </div>
      {(error || uploadError) && <p className="text-xs text-rose-600">{error || uploadError}</p>}
      {helpText && !error && !uploadError && (
        <p className="text-xs text-slate-500">
          {helpText} • Max size: {effectiveMaxSize}MB
        </p>
      )}
    </div>
  );
};