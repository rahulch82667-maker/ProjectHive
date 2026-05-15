import api from './api/axios';

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
}

export interface UploadOptions {
  folder?: string;
  resource_type?: 'auto' | 'image' | 'video';
  tags?: string[];
}

/**
 * Upload a file to Cloudinary
 * @param file - File to upload
 * @param options - Upload options
 * @returns Promise with upload response
 */
export const uploadToCloudinary = async (
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  if (options.folder) {
    formData.append('folder', options.folder);
  }

  if (options.resource_type) {
    formData.append('resource_type', options.resource_type);
  }

  if (options.tags && options.tags.length > 0) {
    formData.append('tags', options.tags.join(','));
  }

  try {
    const response = await api.post('/cloudinary/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param files - Files to upload
 * @param options - Upload options
 * @returns Promise with array of upload responses
 */
export const uploadMultipleToCloudinary = async (
  files: File[],
  options: UploadOptions = {}
): Promise<CloudinaryUploadResponse[]> => {
  try {
    const uploadPromises = files.map((file) => uploadToCloudinary(file, options));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple file upload error:', error);
    throw error;
  }
};

/**
 * Delete a file from Cloudinary
 * @param publicId - Public ID of the file to delete
 * @returns Promise with delete response
 */
export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
  try {
    const response = await api.post('/cloudinary/delete', { publicId });
    return response.data;
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    throw error.response?.data || error;
  }
};

/**
 * Generate a preview URL for a Cloudinary image
 * @param publicId - Public ID of the image
 * @param options - URL generation options
 * @returns Preview URL
 */
export const getCloudinaryImageUrl = (
  publicId: string,
  options: { width?: number; height?: number; crop?: string; quality?: string } = {}
): string => {
  const { width = 500, height = 500, crop = 'fill', quality = 'auto' } = options;

  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_${crop},q_${quality}/${publicId}`;
};
