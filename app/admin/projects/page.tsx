'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AdminProtectedRoute } from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { AppDispatch, RootState } from '@/store/store';
import { fetchProjects, deleteProject } from '@/store/slices/projectsSlice';

export default function AdminProjectsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { projects, loading, error, totalPages, currentPage } = useSelector(
    (state: RootState) => state.projects
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(
      fetchProjects({
        page: 1,
        limit: 10,
        search: searchQuery,
        category: categoryFilter,
        status: statusFilter,
      })
    );
  }, [dispatch, searchQuery, categoryFilter, statusFilter]);

  const handleDeleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await dispatch(deleteProject(id)).unwrap();
      } catch (err: any) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Projects</h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Manage all project listings</p>
            </div>
            <button
              onClick={() => router.push('/admin/projects/add')}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white hover:bg-amber-700 transition self-start sm:self-auto"
            >
              + Add Project
            </button>
          </div>

          {/* Filters */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm space-y-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-4 md:grid-cols-3">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-amber-500"
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">All Categories</option>
                <option value="web-development">Web Development</option>
                <option value="mobile-development">Mobile Development</option>
                <option value="ui-design">UI Design</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Projects Table */}
          <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                  Loading projects...
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">No projects found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">
                        Project
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">
                        Featured
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project._id} className="border-b border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {project.thumbnail && (
                              <img
                                src={project.thumbnail}
                                alt={project.title}
                                className="h-10 w-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">{project.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{project.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{project.category}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                          ${project.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              project.status === 'published'
                                ? 'bg-green-100 text-green-700'
                                : project.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {project.isFeatured ? (
                            <span className="text-amber-600 font-semibold">★</span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">★</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/admin/projects/${project._id}/edit`)}
                              className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project._id)}
                              className="text-rose-600 hover:text-rose-700 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
