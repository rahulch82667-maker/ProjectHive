'use client';

import { useEffect, useState } from 'react';
import { AdminProtectedRoute } from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import AuditLogsTable from '@/components/admin/AuditLogsTable';
import Pagination from '@/components/admin/Pagination';
import { AuditLog, fetchAuditLogs } from '@/services/admin/audit-logs.api';
import { ShieldAlert, Search, RefreshCw, X } from 'lucide-react';

const LIMIT = 15;

const ACTIONS = [
  { value: 'all', label: 'All Actions' },
  { value: 'PROJECT_CREATE', label: 'Project Create' },
  { value: 'PROJECT_EDIT', label: 'Project Edit' },
  { value: 'PROJECT_DELETE', label: 'Project Delete' },
  { value: 'TASK_DELETE', label: 'Task Delete' },
  { value: 'BUDGET_CHANGE', label: 'Budget Change' },
  { value: 'USER_BLOCK_TOGGLE', label: 'User Block/Unblock' },
  { value: 'USER_ROLE_CHANGE', label: 'User Role Change' },
  { value: 'ACCESS_REQUEST_DECISION', label: 'Access Requests' },
];

const DATE_RANGES = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadLogs = async (currentPage = page) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchAuditLogs({
        search: search.trim() || undefined,
        action: action !== 'all' ? action : undefined,
        dateRange: dateRange !== 'all' ? dateRange : undefined,
        page: currentPage,
        limit: LIMIT,
      });

      setLogs(response.logs);
      setTotalPages(response.totalPages || 1);
      setTotalLogs(response.total || 0);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      setError(err?.response?.data?.message || err?.message || 'Could not load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadLogs(1);
  }, [action, dateRange]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadLogs(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setAction('all');
    setDateRange('all');
    setPage(1);
    // Explicitly load logs with default params
    setIsLoading(true);
    fetchAuditLogs({ page: 1, limit: LIMIT })
      .then((response) => {
        setLogs(response.logs);
        setTotalPages(response.totalPages || 1);
        setTotalLogs(response.total || 0);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to reload logs');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadLogs(newPage);
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">Security & Auditing</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldAlert className="text-amber-600 dark:text-amber-500" size={24} />
                Activity Audit Logs
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Track all administrative operations and changes within the admin panel
              </p>
            </div>
            <button
              onClick={() => loadLogs(page)}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 self-start sm:self-auto"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Refresh Logs
            </button>
          </div>

          {/* Filters Card */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <form onSubmit={handleSearchSubmit} className="grid gap-4 md:grid-cols-4 items-end">
              {/* Search */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Search Details / Actor
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by details, email, or name..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-amber-500 dark:focus:bg-slate-800"
                  />
                </div>
              </div>

              {/* Action Filter */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Action Type
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-amber-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {ACTIONS.map((act) => (
                    <option key={act.value} value={act.value}>
                      {act.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Time Period
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-amber-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {DATE_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </form>

            {/* Clear Filter Bar */}
            {(search || action !== 'all' || dateRange !== 'all') && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Showing matches for selected filters
                </span>
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
                >
                  <X size={14} />
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Table Container */}
          <AuditLogsTable logs={logs} isLoading={isLoading} />

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

          {/* Summary Footer */}
          {!isLoading && logs.length > 0 && (
            <div className="text-xs text-slate-400 dark:text-slate-500 text-right px-4">
              Total activities logged: <span className="font-semibold text-slate-600 dark:text-slate-350">{totalLogs}</span>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
