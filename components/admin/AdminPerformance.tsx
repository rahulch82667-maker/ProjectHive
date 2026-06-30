'use client';

import { AdminPerformance as AdminPerformanceType } from '@/services/admin/analytics.api';
import { Clock, ThumbsUp, ThumbsDown, Activity, Hourglass, CheckCircle2, XCircle } from 'lucide-react';

interface AdminPerformanceProps {
  performance: AdminPerformanceType;
}

export default function AdminPerformance({ performance }: AdminPerformanceProps) {
  const formatResponseTime = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}m`;
    }
    if (hours < 24) {
      return `${hours.toFixed(1)}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days}d ${remainingHours}h`;
  };

  const getResponseTimeColor = (hours: number) => {
    if (hours < 4) return 'text-emerald-600 bg-emerald-100';
    if (hours < 24) return 'text-amber-600 bg-amber-100';
    return 'text-rose-600 bg-rose-100';
  };

  const getRateColor = (rate: number, type: 'approval' | 'rejection') => {
    if (type === 'approval') {
      if (rate >= 70) return 'text-emerald-600 bg-emerald-100';
      if (rate >= 40) return 'text-amber-600 bg-amber-100';
      return 'text-rose-600 bg-rose-100';
    }
    if (rate <= 30) return 'text-emerald-600 bg-emerald-100';
    if (rate <= 60) return 'text-amber-600 bg-amber-100';
    return 'text-rose-600 bg-rose-100';
  };

  const cards = [
    {
      title: 'Avg. Response Time',
      value: formatResponseTime(performance.avgResponseTimeHours),
      subtitle: 'Time to approve/reject',
      icon: <Clock size={22} />,
      badge: `${performance.avgResponseTimeHours.toFixed(1)}h`,
      badgeColor: getResponseTimeColor(performance.avgResponseTimeHours),
    },
    {
      title: 'Approval Rate',
      value: `${performance.approvalRate}%`,
      subtitle: `${performance.approvedRequests} approved`,
      icon: <ThumbsUp size={22} />,
      badge: `${performance.approvalRate}%`,
      badgeColor: getRateColor(performance.approvalRate, 'approval'),
    },
    {
      title: 'Rejection Rate',
      value: `${performance.rejectionRate}%`,
      subtitle: `${performance.rejectedRequests} rejected`,
      icon: <ThumbsDown size={22} />,
      badge: `${performance.rejectionRate}%`,
      badgeColor: getRateColor(performance.rejectionRate, 'rejection'),
    },
    {
      title: 'Pending Requests',
      value: performance.pendingRequests.toString(),
      subtitle: 'Awaiting decision',
      icon: <Hourglass size={22} />,
      badge: 'Pending',
      badgeColor: 'text-amber-600 bg-amber-100',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Section Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-500">
          <Activity size={20} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Admin Performance</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Access request handling efficiency</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:shadow-sm dark:border-slate-800/50 dark:bg-slate-950/40"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                {card.icon}
              </div>
              {card.badge && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${card.badgeColor}`}>
                  {card.badge}
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{card.title}</p>
              <p className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-slate-100">{card.value}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar: Approval vs Rejection */}
      {performance.totalDecided > 0 && (
        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800/50 dark:bg-slate-950/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Approved ({performance.approvedRequests})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle size={16} className="text-rose-600" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Rejected ({performance.rejectedRequests})
              </span>
            </div>
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-l-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${performance.approvalRate}%` }}
              title={`Approved: ${performance.approvalRate}%`}
            />
            <div
              className="h-full rounded-r-full bg-rose-500 transition-all duration-500"
              style={{ width: `${performance.rejectionRate}%` }}
              title={`Rejected: ${performance.rejectionRate}%`}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-400 dark:text-slate-500">
            <span>{performance.approvalRate}% approval</span>
            <span>{performance.rejectionRate}% rejection</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {performance.totalDecided === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/30">
          <Activity size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">No decisions yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Approve or reject access requests to see performance metrics here.
          </p>
        </div>
      )}
    </div>
  );
}