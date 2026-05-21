import axiosInstance from './api/axios';
import { Project } from './projects.api';

export interface WishlistResponse {
  message: string;
  action?: 'added' | 'removed';
  wishlist: Project[];
}

export const getWishlistApi = async (): Promise<Project[]> => {
  try {
    const response = await axiosInstance.get('/users/wishlist');
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const toggleWishlistApi = async (projectId: string): Promise<WishlistResponse> => {
  try {
    const response = await axiosInstance.patch('/users/wishlist', { projectId });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const removeFromWishlistApi = async (projectId: string): Promise<WishlistResponse> => {
  try {
    const response = await axiosInstance.delete('/users/wishlist', { data: { projectId } });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};