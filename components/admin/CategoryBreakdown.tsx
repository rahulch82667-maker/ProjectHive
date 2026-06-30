'use client';

import { CategoryRevenue } from '@/services/admin/analytics.api';
import { FolderOpen } from 'lucide-react';

interface CategoryBreakdownProps {
  data: CategoryRevenue[];
}

export default function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Revenue by Category</h3>
        <div className="flex h-32 items-center justify-center text-sm text-slate-400 dark:text-slate-500">
          No category data available yet
        </div>
      </div>
    );
  }

  const totalRevenue = data.reduce((sum, cat) => sum + cat.revenue, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Revenue by Category</h3>
      <p className="text-sm text-slate-500 mb-6 dark:text-slate-400">Breakdown across project categories</p>

      <div className="space-y-4">
        {data.map((category) => {
          const percentage = totalRevenue > 0 ? (category.revenue / totalRevenue) * 100 : 0;
          const colors = [
            'bg-amber-500',
            'bg-blue-500',
            'bg-emerald-500',
            'bg-violet-500',
            'bg-rose-500',
            'bg-indigo-500',
            'bg-teal-500',
            'bg-orange-500',
          ];

          return (
            <div key={category._id || 'uncategorized'}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <FolderOpen size={14} className="text-slate-400 dark:text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {category._id || 'Uncategorized'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(category.revenue)}
                  </span>
                  <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                    ({category.orders} orders)
                  </span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors[data.indexOf(category) % colors.length]}`}
                  style={{ width: `${Math.max(percentage, 1)}%` }}
                />
              </div>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                {percentage.toFixed(1)}% of total revenue
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}