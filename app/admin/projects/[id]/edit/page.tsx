'use client';

import React, { useEffect, useState } from 'react';
import { AdminProtectedRoute } from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { useProjects } from '@/hooks/useProjects';
import { AddProjectForm } from '@/components/form';

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { currentProject, loadProjects } = useProjects();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement fetching single project by ID
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent mx-auto mb-4" />
              <p className="text-slate-600">Loading project...</p>
            </div>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Project</h1>
            <p className="mt-1 text-sm text-slate-600">Update project details</p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <AddProjectForm />
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
