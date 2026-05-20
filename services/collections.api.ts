import axiosInstance from './api/axios';
import { Project } from './projects.api';

export interface Collection {
  _id: string;
  name: string;
  description?: string;
  user: string;
  projects: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionDetail extends Omit<Collection, 'projects'> {
  projects: Project[];
}

export const getCollectionsApi = async (): Promise<Collection[]> => {
  try {
    const response = await axiosInstance.get('/collections');
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const getCollectionByIdApi = async (id: string): Promise<CollectionDetail> => {
  try {
    const response = await axiosInstance.get(`/collections/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const createCollectionApi = async (data: {
  name: string;
  description?: string;
  isPublic?: boolean;
}): Promise<{ collection: Collection; message: string }> => {
  try {
    const response = await axiosInstance.post('/collections', data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const updateCollectionApi = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    isPublic?: boolean;
  }
): Promise<{ collection: Collection; message: string }> => {
  try {
    const response = await axiosInstance.put(`/collections/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const deleteCollectionApi = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.delete(`/collections/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const addProjectToCollectionApi = async (collectionId: string, projectId: string): Promise<{ collection: CollectionDetail; message: string }> => {
  try {
    const response = await axiosInstance.patch(`/collections/${collectionId}/projects`, { projectId });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const removeProjectFromCollectionApi = async (collectionId: string, projectId: string): Promise<{ collection: CollectionDetail; message: string }> => {
  try {
    const response = await axiosInstance.delete(`/collections/${collectionId}/projects`, { data: { projectId } });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
