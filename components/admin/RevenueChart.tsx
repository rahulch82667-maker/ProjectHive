'use client';

import { MonthlyRevenue } from '@/services/admin/analytics.api';

interface RevenueChartProps {
  data: MonthlyRevenue[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No revenue data available yet
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Revenue Trend</h3>
          <p className="mt-1 text-sm text-slate-500">Monthly revenue overview</p>
        </div>
      </div>

      <div className="mt-8">
        {/* Chart area */}
        <div className="relative h-64">
          {/* Y-axis labels */}
          <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-400">
            <span>{formatCurrency(maxRevenue)}</span>
            <span>{formatCurrency(Math.round(maxRevenue * 0.75))}</span>
            <span>{formatCurrency(Math.round(maxRevenue * 0.5))}</span>
            <span>{formatCurrency(Math.round(maxRevenue * 0.25))}</span>
            <span>$0</span>
          </div>

          {/* Grid lines */}
          <div className="ml-16 h-full">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="border-t border-slate-100"
                style={{ height: '25%' }}
              />
            ))}

            {/* Bars */}
            <div className="absolute inset-0 ml-16 flex items-end gap-2 pb-6">
              {data.map((item) => {
                const height = (item.revenue / maxRevenue) * 100;
                return (
                  <div
                    key={item.month}
                    className="group relative flex flex-1 flex-col items-center justify-end h-full"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-8 z-10 hidden group-hover:block">
                      <div className="whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg">
                        {formatCurrency(item.revenue)}
                      </div>
                    </div>
                    {/* Bar */}
                    <div
                      className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-amber-500 to-amber-400 transition-all hover:from-amber-600 hover:to-amber-500"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    {/* Month label */}
                    <span className="absolute -bottom-5 text-[10px] text-slate-400 whitespace-nowrap">
                      {item.month.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend / Summary */}
      <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-slate-400">Total Revenue</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {formatCurrency(data.reduce((sum, d) => sum + d.revenue, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-slate-400">Total Orders</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {data.reduce((sum, d) => sum + d.orders, 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-slate-400">Avg Monthly</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {formatCurrency(Math.round(data.reduce((sum, d) => sum + d.revenue, 0) / data.length))}
          </p>
        </div>
      </div>
    </div>
  );
}