import React from 'react';
import { AuditLog } from '@/services/admin/audit-logs.api';

interface AuditLogsTableProps {
  logs: AuditLog[];
  isLoading: boolean;
}

export default function AuditLogsTable({ logs, isLoading }: AuditLogsTableProps) {
  const getActionBadgeClass = (action: AuditLog['action']) => {
    switch (action) {
      case 'PROJECT_CREATE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40';
      case 'PROJECT_EDIT':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40';
      case 'PROJECT_DELETE':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40';
      case 'TASK_DELETE':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40';
      case 'BUDGET_CHANGE':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40';
      case 'USER_BLOCK_TOGGLE':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/40';
      case 'USER_ROLE_CHANGE':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/40';
      case 'ACCESS_REQUEST_DECISION':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/40';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const getActionLabel = (action: AuditLog['action']) => {
    return action.replace(/_/g, ' ');
  };

  const formatTimestamp = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Audit Logs</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A history of administrator and system activities.
        </p>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full divide-y divide-slate-200 text-left text-sm text-slate-700 dark:divide-slate-800 dark:text-slate-300">
          <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <tr>
              <th className="px-6 py-4 font-medium w-[15%]">Timestamp</th>
              <th className="px-6 py-4 font-medium w-[20%]">Actor</th>
              <th className="px-6 py-4 font-medium w-[15%]">Action</th>
              <th className="px-6 py-4 font-medium w-[38%]">Details</th>
              <th className="px-6 py-4 font-medium w-[12%]">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                    Loading audit logs...
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  No audit logs found matching the filters.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log._id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-850/40 transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatTimestamp(log.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {log.userName}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {log.userEmail}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide whitespace-nowrap ${getActionBadgeClass(
                        log.action
                      )}`}
                    >
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    <div className="max-w-md break-words">{log.details}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                    {log.ipAddress || 'unknown'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
