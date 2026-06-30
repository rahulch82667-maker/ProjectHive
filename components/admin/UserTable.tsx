'use client';

import { AdminUser } from '@/services/admin/admin.api';

interface UserTableProps {
  users: AdminUser[];
  isLoading: boolean;
  updatingId?: string;
  onRoleChange: (id: string, role: 'user' | 'admin') => void;
  onBlockToggle: (id: string, isBlocked: boolean) => void;
}

export default function UserTable({ users, isLoading, updatingId, onRoleChange, onBlockToggle }: UserTableProps) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">User Accounts</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage user roles, block status, and account access.</p>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full divide-y divide-slate-200 text-left text-sm text-slate-700 dark:divide-slate-800 dark:text-slate-300">
          <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <tr>
              <th className="px-6 py-4 font-medium w-[20%]">Name</th>
              <th className="px-6 py-4 font-medium w-[30%]">Email</th>
              <th className="px-6 py-4 font-medium w-[15%]">Role</th>
              <th className="px-6 py-4 font-medium w-[15%]">Status</th>
              <th className="px-6 py-4 font-medium w-[20%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isUpdating = updatingId === user._id;
                return (
                  <tr key={user._id} className={user.role === 'admin' ? 'bg-slate-50 dark:bg-slate-800/20' : ''}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-700 break-words dark:text-slate-300">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        disabled={isUpdating}
                        onChange={(event) => onRoleChange(user._id, event.target.value as 'user' | 'admin')}
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-amber-500 w-full dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-amber-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${user.isBlocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => onBlockToggle(user._id, !user.isBlocked)}
                        className="inline-flex items-center rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}