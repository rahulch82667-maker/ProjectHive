'use client';

import React, { useState } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
}

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
          <AdminNavbar user={user} onMenuClick={() => setIsSidebarOpen(true)} />

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

