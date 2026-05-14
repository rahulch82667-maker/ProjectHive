'use client';

import { AdminProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Panel</h1>
            <p className="text-gray-600 mb-6">Welcome to the admin dashboard, {user?.name}!</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">User Management</h3>
                <p className="text-blue-700">Manage user accounts and permissions</p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Analytics</h3>
                <p className="text-green-700">View system analytics and reports</p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Settings</h3>
                <p className="text-purple-700">Configure system settings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}