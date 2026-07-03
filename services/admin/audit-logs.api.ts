import api from '../api/axios';

export interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action:
    | 'PROJECT_CREATE'
    | 'PROJECT_EDIT'
    | 'PROJECT_DELETE'
    | 'TASK_DELETE'
    | 'BUDGET_CHANGE'
    | 'USER_BLOCK_TOGGLE'
    | 'USER_ROLE_CHANGE'
    | 'ACCESS_REQUEST_DECISION';
  details: string;
  ipAddress?: string;
  createdAt: string;
} 

export interface AuditLogListResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchAuditLogsParams {
  search?: string;
  action?: string;
  dateRange?: 'today' | 'week' | 'month' | 'all';
  page?: number;
  limit?: number;
}

export const fetchAuditLogs = async (
  params: FetchAuditLogsParams = {}
): Promise<AuditLogListResponse> => {
  const response = await api.get('/admin/audit-logs', {
    params,
  });
  return response.data;
};
