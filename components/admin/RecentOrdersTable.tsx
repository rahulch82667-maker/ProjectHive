'use client';

import { RecentOrder } from '@/services/admin/analytics.api';
import Image from 'next/image';
import { formatDate, formatCurrency } from '@/services/admin/analytics.api';

interface RecentOrdersTableProps {
  orders: RecentOrder[];
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Recent Orders</h3>
        <div className="flex h-32 items-center justify-center text-sm text-slate-400">
          No orders yet
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
          <p className="mt-1 text-sm text-slate-500">Latest completed purchases</p>
        </div>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition hover:bg-slate-50"
          >
            {/* Project Thumbnail */}
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200">
              {order.project?.thumbnail ? (
                <Image
                  src={order.project.thumbnail}
                  alt={order.project?.title || 'Project'}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                  N/A
                </div>
              )}
            </div>

            {/* Order Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {order.project?.title || 'Deleted Project'}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {order.user?.avatar ? (
                  <Image
                    src={order.user.avatar}
                    alt={order.user.name}
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-4 w-4 rounded-full bg-slate-300" />
                )}
                <p className="text-xs text-slate-500">
                  {order.user?.name || 'Unknown User'}
                </p>
              </div>
            </div>

            {/* Amount & Date */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-emerald-600">
                {formatCurrency(order.amount)}
              </p>
              <p className="text-xs text-slate-400">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}