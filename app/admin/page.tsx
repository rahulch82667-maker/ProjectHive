'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/admin/AdminLayout';
import { fetchAnalytics, AnalyticsData } from '@/services/admin/analytics.api';
import AnalyticsSummaryCards from '@/components/admin/AnalyticsSummaryCards';
import RevenueChart from '@/components/admin/RevenueChart';
import TopProjectsTable from '@/components/admin/TopProjectsTable';
import CategoryBreakdown from '@/components/admin/CategoryBreakdown';
import RecentOrdersTable from '@/components/admin/RecentOrdersTable';
import AdminPerformance from '@/components/admin/AdminPerformance';
import { BarChart3, RefreshCw, AlertCircle } from 'lucide-react';

const PERIODS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
] as const;

export default function AdminPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');

  const loadAnalytics = useCallback(async (selectedPeriod: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAnalytics(selectedPeriod);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics(period);
  }, [period, loadAnalytics]);

  return (
    <AdminProtectedRoute>
      <AdminLayout user={user ?? undefined}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">Dashboard</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Analytics Overview
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Real-time sales data and performance metrics for every project
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Period Selector */}
              <div className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPeriod(p.value)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                      period === p.value
                        ? 'bg-amber-100 text-amber-800 shadow-sm dark:bg-amber-900/40 dark:text-amber-400'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => loadAnalytics(period)}
                disabled={loading}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && !data && (
          <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading analytics data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/40">
                <AlertCircle size={28} className="text-rose-600 dark:text-rose-500" />
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Failed to load analytics</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">{error}</p>
              <button
                onClick={() => loadAnalytics(period)}
                className="mt-2 rounded-xl bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Analytics Content */}
        {data && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <AnalyticsSummaryCards summary={data.summary} />

            {/* Admin Performance Section */}
            <AdminPerformance performance={data.adminPerformance} />

            {/* Chart + Category Breakdown */}
            <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
              <RevenueChart data={data.monthlyRevenue} />
              <CategoryBreakdown data={data.revenueByCategory} />
            </div>

            {/* Top Projects + Recent Orders */}
            <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
              <TopProjectsTable projects={data.topProjects} />
              <RecentOrdersTable orders={data.recentOrders} />
            </div>

            {/* Quick Status Footer */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-500">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Payment Status</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Breakdown of all transactions</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {data.paymentStatusBreakdown.map((status) => (
                  <div
                    key={status._id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center dark:border-slate-800/50 dark:bg-slate-950/40"
                  >
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        status._id === 'paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : status._id === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {status._id}
                    </span>
                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{status.count}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                      }).format(status.total)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
