'use client';

import React from 'react';
import { AdminProtectedRoute } from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { AddProjectForm } from '@/components/form';

export default function AddProjectPage() {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add New Project</h1>
            <p className="mt-1 text-sm text-slate-600">Create a new project listing</p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <AddProjectForm />
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
