'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, DollarSign, Loader2 } from 'lucide-react';
import api from '@/services/api/axios';

interface Task {
  _id: string;
  name: string;
  completed: boolean;
}

interface Project {
  _id: string;
  title: string;
  budget?: number;
  price: number;
}

interface TasksBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onUpdate: () => void;
}

export default function TasksBudgetModal({
  isOpen,
  onClose,
  project,
  onUpdate,
}: TasksBudgetModalProps) {
  const [budget, setBudget] = useState<number>(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [loading, setLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && project) {
      setBudget(project.budget || 0);
      fetchTasks();
    }
  }, [isOpen, project]);

  const fetchTasks = async () => {
    if (!project) return;
    setTasksLoading(true);
    setError('');
    try {
      const res = await api.get(`/projects/${project._id}/tasks`);
      setTasks(res.data.tasks || []);
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err);
      setError(err?.response?.data?.message || 'Failed to load tasks');
    } finally {
      setTasksLoading(false);
    }
  };

  const handleUpdateBudget = async () => {
    if (!project) return;
    setBudgetSaving(true);
    setError('');
    try {
      await api.put(`/projects/${project._id}/budget`, { budget: Number(budget) });
      onUpdate(); // trigger refresh in parent table
    } catch (err: any) {
      console.error('Failed to update budget:', err);
      setError(err?.response?.data?.message || 'Failed to update budget');
    } finally {
      setBudgetSaving(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !newTaskName.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/projects/${project._id}/tasks`, {
        name: newTaskName.trim(),
      });
      setTasks(res.data.tasks || []);
      setNewTaskName('');
    } catch (err: any) {
      console.error('Failed to add task:', err);
      setError(err?.response?.data?.message || 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    if (!project) return;
    try {
      const res = await api.patch(`/projects/${project._id}/tasks/${taskId}`, {
        completed: !currentCompleted,
      });
      setTasks(res.data.tasks || []);
    } catch (err: any) {
      console.error('Failed to toggle task:', err);
      setError(err?.response?.data?.message || 'Failed to toggle task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!project) return;
    setError('');
    try {
      const res = await api.delete(`/projects/${project._id}/tasks/${taskId}`);
      setTasks(res.data.tasks || []);
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      setError(err?.response?.data?.message || 'Failed to delete task');
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-900">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Tasks & Budget</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Project: <span className="font-semibold text-slate-700 dark:text-slate-350">{project.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-6">
          {/* Budget Management */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Project Budget
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-amber-500 dark:focus:bg-slate-800"
                />
              </div>
              <button
                type="button"
                onClick={handleUpdateBudget}
                disabled={budgetSaving}
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-amber-600 px-5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-55"
              >
                {budgetSaving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  'Update Budget'
                )}
              </button>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800/80" />

          {/* Tasks Management */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
              Project Tasks
            </label>

            {/* Task Add Form */}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Enter task name..."
                required
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-amber-500 dark:focus:bg-slate-800"
              />
              <button
                type="submit"
                disabled={loading || !newTaskName.trim()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-850 dark:hover:bg-slate-800"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={18} />}
              </button>
            </form>

            {/* Task List */}
            <div className="mt-3 max-h-48 overflow-y-auto space-y-2 pr-1">
              {tasksLoading ? (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  <Loader2 className="animate-spin inline-block mr-1.5" size={14} />
                  Loading tasks...
                </div>
              ) : tasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                  No tasks defined for this project.
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 transition dark:border-slate-800/40 dark:bg-slate-950/20 dark:hover:bg-slate-950/40"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task._id, task.completed)}
                        className="h-4.5 w-4.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800"
                      />
                      <span
                        className={`text-sm font-medium ${
                          task.completed
                            ? 'text-slate-400 line-through dark:text-slate-550'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {task.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task._id)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition"
                      title="Delete Task"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
