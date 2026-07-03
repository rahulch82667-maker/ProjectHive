'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AdminProtectedRoute } from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import TasksBudgetModal from '@/components/admin/TasksBudgetModal';
import { AppDispatch, RootState } from '@/store/store';
import { fetchProjects, deleteProject } from '@/store/slices/projectsSlice';
import { Project } from '@/services/projects.api';
import { LayoutList, DollarSign, Plus } from 'lucide-react';

export default function AdminProjectsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { projects, loading, error, totalPages, currentPage } = useSelector(
    (state: RootState) => state.projects
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Tasks & Budget Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const loadProjects = () => {
    dispatch(
      fetchProjects({
        page: 1,
        limit: 10,
        search: searchQuery,
        category: categoryFilter,
        status: statusFilter,
      })
    );
  };

  useEffect(() => {
    loadProjects();
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

  const handleOpenTasksBudget = (project: Project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedProject(null);
  };

  const handleModalUpdate = () => {
    // Refresh projects list after a budget change to reflect updated data
    loadProjects();
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">
                Project Management
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Projects
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Manage all project listings, budgets, and tasks
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/projects/add')}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-6 py-3 font-semibold text-white hover:bg-amber-700 transition self-start sm:self-auto shadow-sm"
            >
              <Plus size={16} />
              Add Project
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
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-amber-500 dark:focus:bg-slate-800"
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">All Categories</option>
                <option value="web-development">Web Development</option>
                <option value="mobile-development">Mobile Development</option>
                <option value="ui-design">UI Design</option>
                <option value="ux-design">UX Design</option>
                <option value="graphic-design">Graphic Design</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
            <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
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
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                No projects found
              </div>
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
                        Budget
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
                      <tr
                        key={project._id}
                        className="border-b border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {project.thumbnail && (
                              <img
                                src={project.thumbnail}
                                alt={project.title}
                                className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {project.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {project.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {project.category}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                          ${project.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {project.budget !== undefined && project.budget > 0 ? (
                            <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                              <DollarSign size={13} />
                              {project.budget.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-600 italic text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              project.status === 'published'
                                ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                                : project.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-400'
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() =>
                                router.push(`/admin/projects/${project._id}/edit`)
                              }
                              className="text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 text-sm font-medium transition"
                            >
                              Edit
                            </button>
                            <span className="text-slate-300 dark:text-slate-700">|</span>
                            <button
                              onClick={() => handleOpenTasksBudget(project as Project)}
                              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium transition"
                              title="Manage Tasks & Budget"
                            >
                              <LayoutList size={14} />
                              Tasks
                            </button>
                            <span className="text-slate-300 dark:text-slate-700">|</span>
                            <button
                              onClick={() => handleDeleteProject(project._id)}
                              className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 text-sm font-medium transition"
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

        {/* Tasks & Budget Modal */}
        <TasksBudgetModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          project={selectedProject}
          onUpdate={handleModalUpdate}
        />
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
