'use client';

import { ReactNode } from 'react';

interface AdminStatCardProps {
  title: string;
  value: string;
  trend: string;
  description: string;
  icon: ReactNode;
  highlight?: boolean;
}

export default function AdminStatCard({ title, value, trend, description, icon, highlight = false }: AdminStatCardProps) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 ${highlight ? 'bg-gradient-to-br from-amber-50 to-white' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
          {icon}
        </div>
        <span className="text-sm font-semibold text-emerald-600">{trend}</span>
      </div>
      <div className="mt-6">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-400">{title}</p>
        <p className="mt-3 text-4xl font-semibold text-slate-900">{value}</p>
        <p className="mt-3 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
