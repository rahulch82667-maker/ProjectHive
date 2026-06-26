import api from '../api/axios';

export interface NotificationItem {
  type: 'new_project' | 'draft_project' | 'pending_approval';
  label: string;
  message: string;
  link: string;
  createdAt: string;
  projectTitle: string;
}

export interface NotificationCounts {
  total: number;
  newProjects: number;
  draftProjects: number;
  pendingApprovals: number;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  counts: NotificationCounts;
}

export const fetchNotifications = async (): Promise<NotificationsResponse> => {
  const response = await api.get('/admin/notifications');
  return response.data;
};