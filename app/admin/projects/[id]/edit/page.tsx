'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AdminProtectedRoute } from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { AppDispatch, RootState } from '@/store/store';
import { fetchProjectById, clearCurrentProject } from '@/store/slices/projectsSlice';
import { AddProjectForm } from '@/components/form';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const dispatch = useDispatch<AppDispatch>();

  const { currentProject, loading, error } = useSelector(
    (state: RootState) => state.projects
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
    }
    return () => {
      dispatch(clearCurrentProject());
    };
  }, [id, dispatch]);

  // Map the fetched project to the shape AddProjectForm expects
  const initialValues = currentProject
    ? {
        title: currentProject.title ?? '',
        shortDescription: currentProject.shortDescription ?? '',
        fullDescription: currentProject.fullDescription ?? '',
        price: currentProject.price ?? 0,
        discountPrice: currentProject.discountPrice ?? 0,
        discountPercentage: currentProject.discountPercentage ?? 0,
        category: currentProject.category ?? '',
        tags: currentProject.tags ?? [],
        thumbnail: currentProject.thumbnail ?? '',
        images: currentProject.images ?? [],
        demoVideo: currentProject.demoVideo ?? '',
        liveDemoLink: currentProject.liveDemoLink ?? '',
        technologies: currentProject.technologies ?? [],
        isFeatured: currentProject.isFeatured ?? false,
        isPublished: currentProject.isPublished ?? false,
        status: (currentProject.status as 'draft' | 'published' | 'archived') ?? 'draft',
        stock: currentProject.stock ?? -1,
        faq: currentProject.faq ?? [],
        requirements: currentProject.requirements ?? [],
        fileSize: currentProject.fileSize ?? '',
        version: currentProject.version ?? '',
        zipUrl: currentProject.zipUrl ?? '',
      }
    : undefined;

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        {/* Loading state */}
        {loading && !currentProject && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-600 border-t-transparent mb-4" />
            <p className="text-slate-500 text-sm">Loading project details…</p>
          </div>
        )}

        {/* Error / not found state */}
        {!loading && error && !currentProject && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle className="h-12 w-12 text-rose-400 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-1">Project not found</h2>
            <p className="text-slate-500 text-sm mb-6">{error}</p>
            <Link
              href="/admin/projects"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Link>
          </div>
        )}

        {/* Form — shown once the project is loaded */}
        {currentProject && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/projects')}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Edit Project</h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  Editing: <span className="font-medium text-slate-700">{currentProject.title}</span>
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <AddProjectForm
                initialValues={initialValues}
                isEdit={true}
                projectId={id}
              />
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
