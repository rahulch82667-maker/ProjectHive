'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminProtectedRoute } from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import UserTable from '@/components/admin/UserTable';
import Pagination from '@/components/admin/Pagination';
import { AdminUser, AdminUserListResponse, fetchAdminUsers, updateAdminUser } from '@/services/admin/admin.api';

const DEFAULT_LIMIT = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response: AdminUserListResponse = await fetchAdminUsers({
        search: searchQuery,
        page,
        limit,
      });

      setUsers(response.users);
      setPage(response.page);
      setTotalPages(response.totalPages);
      setTotalUsers(response.totalUsers);
    } catch (err: any) {
      console.error('Failed to fetch admin users', err);
      setError(err?.response?.data?.message || err?.message || 'Could not load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery, limit]);

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleRoleChange = async (id: string, role: 'user' | 'admin') => {
    setUpdatingId(id);
    setError('');

    try {
      await updateAdminUser(id, { role });
      await fetchUsers();
    } catch (err: any) {
      console.error('Failed to update role', err);
      setError(err?.response?.data?.message || err?.message || 'Could not update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBlockToggle = async (id: string, isBlocked: boolean) => {
    setUpdatingId(id);
    setError('');

    try {
      await updateAdminUser(id, { isBlocked });
      await fetchUsers();
    } catch (err: any) {
      console.error('Failed to update block state', err);
      setError(err?.response?.data?.message || err?.message || 'Could not update user status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex w-full items-center gap-3">
                <label htmlFor="user-search" className="sr-only">Search users</label>
                <input
                  id="user-search"
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                  placeholder="Search by name or email"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-amber-500 dark:focus:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex h-12 items-center rounded-3xl bg-amber-600 px-6 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Remove the grid layout and use full width */}
          <div className="space-y-4">
            {error && (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
                {error}
              </div>
            )}
            <UserTable
              users={users}
              isLoading={isLoading}
              updatingId={updatingId || undefined}
              onRoleChange={handleRoleChange}
              onBlockToggle={handleBlockToggle}
            />
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}