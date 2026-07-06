import api from '../api/axios';

export type DateRange = 'daily' | '3days' | '5days' | 'weekly' | 'monthly' | 'custom';

export type ReportType = 'projects' | 'tasks' | 'users' | 'financial' | 'audit' | 'performance';

export type ExportFormat = 'csv' | 'pdf' | 'xlsx' | 'json';

export interface ExportParams {
  range: DateRange;
  type: ReportType;
  format: ExportFormat;
  startDate?: string;
  endDate?: string;
}

/**
 * Trigger an export file download from the server.
 * The response is a binary stream that will be saved as a file download.
 */
export async function exportReport(params: ExportParams): Promise<void> {
  const response = await api.get('/admin/exports', {
    params: {
      range: params.range,
      type: params.type,
      format: params.format,
      startDate: params.startDate || undefined,
      endDate: params.endDate || undefined,
    },
    responseType: 'blob',
  });

  // Extract filename from Content-Disposition header
  const disposition = response.headers['content-disposition'];
  let filename = `${params.type}_report.${params.format}`;
  if (disposition) {
    const match = disposition.match(/filename="?(.+?)"?$/);
    if (match) {
      filename = match[1];
    }
  }

  // Create download link and trigger click
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Labels for report types (for display in the UI).
 */
export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  projects: 'Project Reports',
  tasks: 'Task Reports',
  users: 'User Reports',
  financial: 'Financial Reports',
  audit: 'Audit Logs',
  performance: 'Performance Reports',
};

export const REPORT_TYPE_DESCRIPTIONS: Record<ReportType, string> = {
  projects: 'All project data with status, progress, and timelines',
  tasks: 'Task completion rates, pending tasks, overdue tasks',
  users: 'User activity, role distribution, engagement metrics',
  financial: 'Budget utilization, costs, revenue',
  audit: 'Full audit trail for compliance',
  performance: 'Team performance, productivity metrics',
};

export const DATE_RANGE_LABELS: Record<DateRange, string> = {
  daily: 'Daily',
  '3days': 'Last 3 Days',
  '5days': 'Last 5 Days',
  weekly: 'Weekly',
  monthly: 'Monthly',
  custom: 'Custom Range',
};

export const FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: 'CSV (.csv)',
  pdf: 'PDF (.pdf)',
  xlsx: 'Excel (.xlsx)',
  json: 'JSON (.json)',
};

export const FORMAT_ICONS: Record<ExportFormat, string> = {
  csv: '📊',
  pdf: '📄',
  xlsx: '📗',
  json: '📋',
};