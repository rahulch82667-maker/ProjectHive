'use client';

import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { signOut } from 'firebase/auth';
import { Settings, User } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { auth } from '@/lib/firebase';
import { logoutUser } from '@/store/slices/authSlice';
import { logoutApi } from '@/services/auth/auth.api';

interface AdminNavbarProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
}

export default function AdminNavbar({ user }: AdminNavbarProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutApi();
      await signOut(auth);
      dispatch(logoutUser());
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback: clear local auth state and redirect anyway
      dispatch(logoutUser());
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/80 backdrop-blur-xl">
      <div className="flex flex-col gap-3 px-5 py-4 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Right Section */}
          <div className="ml-auto flex flex-col gap-3 sm:flex-row sm:items-center">
            
            {/* Notifications */}
            <NotificationDropdown />

            {/* Settings */}
            <button className="inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100">
              <Settings size={20} />
            </button>

            {/* User + Dropdown */}
            <div className="relative group">
              
              {/* User Card */}
              <div className="flex cursor-pointer items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
                  <User size={20} />
                </div>
                <div className="text-sm leading-tight">
                  <p className="font-semibold text-slate-900">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-slate-500">Administrator</p>
                </div>
              </div>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 hidden w-40 rounded-xl border border-slate-200 bg-white shadow-lg group-hover:block">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-slate-100 rounded-xl"
                >
                  Logout
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </header>
  );
}