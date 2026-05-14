import api from '../api/axios';

export interface AdminUser {
  _id: string;
  firebaseUid: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'email' | 'google';
  role: 'user' | 'admin';
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  page: number;
  limit: number;
  totalPages: number;
  totalUsers: number;
}

export const fetchAdminUsers = async (params: { search?: string; page?: number; limit?: number }): Promise<AdminUserListResponse> => {
  const response = await api.get('/admin/users', {
    params,
  });

  return response.data;
};

export const updateAdminUser = async (id: string, data: { role?: 'user' | 'admin'; isBlocked?: boolean }) => {
  if (!id) {
    throw new Error('Invalid user id');
  }
  const response = await api.patch(`/admin/users/${encodeURIComponent(id)}`, data);
  return response.data;
};
