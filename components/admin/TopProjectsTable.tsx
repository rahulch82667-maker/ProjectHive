'use client';

import { TopProject } from '@/services/admin/analytics.api';
import Image from 'next/image';
import Link from 'next/link';

interface TopProjectsTableProps {
  projects: TopProject[];
}

export default function TopProjectsTable({ projects }: TopProjectsTableProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  if (!projects || projects.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        No sales data available yet
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Top Performing Projects</h3>
          <p className="mt-1 text-sm text-slate-500">Best sellers by revenue</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                #
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Project
              </th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                Category
              </th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                Orders
              </th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {projects.map((project, index) => (
              <tr key={project._id} className="group hover:bg-slate-50 transition-colors">
                <td className="py-3 text-slate-400 font-medium">
                  {index + 1}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {project.thumbnail ? (
                        <Image
                          src={project.thumbnail}
                          alt={project.title}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                          N/A
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate max-w-[200px]">
                        {project.title || 'Untitled Project'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatCurrency(project.price)} per license
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {project.category || 'Uncategorized'}
                  </span>
                </td>
                <td className="py-3 text-right font-semibold text-slate-900">
                  {project.orders}
                </td>
                <td className="py-3 text-right font-semibold text-emerald-600">
                  {formatCurrency(project.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}