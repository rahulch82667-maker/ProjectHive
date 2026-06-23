'use client';

import { AnalyticsSummary } from '@/services/admin/analytics.api';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, Clock } from 'lucide-react';

interface AnalyticsSummaryCardsProps {
  summary: AnalyticsSummary;
}

export default function AnalyticsSummaryCards({ summary }: AnalyticsSummaryCardsProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const cards = [
    {
      title: 'Period Revenue',
      value: formatCurrency(summary.totalRevenue),
      icon: <DollarSign size={22} />,
      color: 'bg-emerald-100 text-emerald-700',
      description: 'Revenue this period',
    },
    {
      title: 'Period Orders',
      value: summary.totalOrders.toString(),
      icon: <ShoppingCart size={22} />,
      color: 'bg-blue-100 text-blue-700',
      description: 'Orders this period',
    },
    {
      title: 'Avg. Order Value',
      value: formatCurrency(summary.avgOrderValue),
      icon: <TrendingUp size={22} />,
      color: 'bg-violet-100 text-violet-700',
      description: 'Average per order',
    },
    {
      title: 'Total Users',
      value: summary.totalUsers.toLocaleString(),
      icon: <Users size={22} />,
      color: 'bg-amber-100 text-amber-700',
      description: 'Registered users',
    },
    {
      title: 'Published Projects',
      value: summary.totalProjects.toString(),
      icon: <Package size={22} />,
      color: 'bg-indigo-100 text-indigo-700',
      description: 'Active projects',
    },
    {
      title: 'All-Time Revenue',
      value: formatCurrency(summary.allTimeRevenue),
      icon: <DollarSign size={22} />,
      color: 'bg-rose-100 text-rose-700',
      description: 'Lifetime earnings',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-3">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{card.title}</p>
            <p className="mt-1.5 text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}