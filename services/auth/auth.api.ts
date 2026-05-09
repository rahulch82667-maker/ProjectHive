import api from '../api/axios';
import { auth } from '@/lib/firebase';

// Helper to get Firebase ID token
const getIdToken = async (): Promise<string | null> => {
  if (!auth?.currentUser) return null;
  return await auth.currentUser.getIdToken();
};

export interface AuthResponse {
  _id: string;
  firebaseUid: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface GenericResponse {
  success: boolean;
  message: string;
}

export const signupApi = async (data: { firebaseUid: string; email: string; name: string; provider: string; avatar?: string }): Promise<AuthResponse> => {
  const idToken = await getIdToken();
  const response = await api.post('/auth/signup', data, {
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined,
  });
  return response.data;
};

export const loginApi = async (): Promise<AuthResponse> => {
  const idToken = await getIdToken();
  const response = await api.post('/auth/login', undefined, {
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined,
  });
  return response.data;
};

export const googleAuthApi = async (): Promise<AuthResponse> => {
  const idToken = await getIdToken();
  const response = await api.post('/auth/google', undefined, {
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined,
  });
  return response.data;
};

export const getMeApi = async (): Promise<AuthResponse> => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logoutApi = async (): Promise<{ status: string; message: string }> => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const forgotPasswordApi = async (email: string): Promise<GenericResponse> => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};
