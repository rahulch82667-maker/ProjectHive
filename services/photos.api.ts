import axiosInstance from './api/axios';

export interface Photo {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  tags: string[];
  technologies: string[];
  createdBy: { _id: string; name: string; email: string };
  updatedBy: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface PhotosResponse {
  photos: Photo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    tags: string[];
    technologies: string[];
  };
}

export interface PhotoFilters {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'price-asc' | 'price-desc';
  tags?: string[];
  technologies?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export const getPhotosApi = async (filters: PhotoFilters = {}): Promise<PhotosResponse> => {
  try {
    const response = await axiosInstance.get('/photos', { params: filters });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const createPhotoApi = async (data: {
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  tags: string[];
  technologies: string[];
}): Promise<{ photo: Photo; message: string }> => {
  try {
    const response = await axiosInstance.post('/photos', data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const uploadPhotoImageApi = async (file: File): Promise<{ url: string; message: string }> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axiosInstance.post('/photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const updatePhotoApi = async (id: string, data: Partial<Omit<Photo, '_id' | 'createdAt' | 'updatedAt'>>): Promise<{ photo: Photo; message: string }> => {
  try {
    const response = await axiosInstance.put(`/photos/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const deletePhotoApi = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(`/photos/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};