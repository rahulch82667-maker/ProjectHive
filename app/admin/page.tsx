'use client';

import { AdminProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminStatCard from '@/components/admin/AdminStatCard';
import { Users2, Activity, DollarSign, Camera } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { user } = useAuth();
  
  return (
    <AdminProtectedRoute>
      <AdminLayout user={user ?? undefined}>
        <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Welcome back</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">Good to see you, {user?.name || 'Admin'}!</h2>
                </div>
                <div className="rounded-3xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-900 shadow-sm">
                  Admin Panel Overview
                </div>
              </div>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-600">
                Manage your organization, review key statistics, and monitor the latest activity in your Hive.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <AdminStatCard
                title="Total users"
                value="1,284"
                trend="+12%"
                description="Growth over the last month"
                icon={<Users2 size={22} />}
              />
              <AdminStatCard
                title="Active hives"
                value="42"
                trend="+5%"
                description="Current active projects"
                icon={<Activity size={22} />}
              />
              <AdminStatCard
                title="Monthly revenue"
                value="$12,482"
                trend="-2%"
                description="Compared to last month"
                icon={<DollarSign size={22} />}
              />
            </div>

            {/* Quick Links */}
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  href="/admin/photos"
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-amber-200 hover:bg-amber-50 transition-all group"
                >
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-200">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Manage Photos</p>
                    <p className="text-xs text-slate-500">Add, edit, or remove photos</p>
                  </div>
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-amber-200 hover:bg-amber-50 transition-all group"
                >
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-200">
                    <Users2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Manage Users</p>
                    <p className="text-xs text-slate-500">View and manage user accounts</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Quick status</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">System health</h3>
              </div>
              <span className="rounded-3xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                Stable
              </span>
            </div>
            <div className="mt-8 space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div>
                  <p className="font-semibold text-slate-900">Active sessions</p>
                  <p className="text-slate-500">342 users currently online</p>
                </div>
                <span className="text-slate-700">+8%</span>
              </div>
              <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div>
                  <p className="font-semibold text-slate-900">Pending approvals</p>
                  <p className="text-slate-500">12 requests waiting review</p>
                </div>
                <span className="text-amber-700">12</span>
              </div>
              <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div>
                  <p className="font-semibold text-slate-900">Alerts</p>
                  <p className="text-slate-500">2 items require attention</p>
                </div>
                <span className="text-rose-600">2</span>
              </div>
            </div>
          </div>
        </section>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}