'use client';

import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { signOut } from 'firebase/auth';
import { Settings, User, Menu, Sun, Moon } from 'lucide-react';
import Image from 'next/image';
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
  onMenuClick?: () => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
}

export default function AdminNavbar({ user, onMenuClick, theme = 'light', onThemeToggle }: AdminNavbarProps) {
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
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/80 backdrop-blur-xl transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/80">
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left Section: Menu Toggle + Brand Logo (Mobile only) */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={onMenuClick}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
            <div className="relative h-8 w-24">
              <Image
                src="/Images/Hive_logo.png"
                alt="ProjectHive Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </div>

          {/* Desktop Left Title */}
          <div className="hidden lg:block text-slate-500 font-semibold text-sm transition-colors dark:text-slate-400">
            Admin Panel
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            
            {/* Notifications */}
            <NotificationDropdown />

            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Settings */}
            <button className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
              <Settings size={20} />
            </button>

            {/* User + Dropdown */}
            <div className="relative group">
              
              {/* User Card */}
              <div className="flex cursor-pointer items-center gap-2 sm:gap-3 rounded-3xl border border-slate-200 bg-white px-3 py-1.5 sm:px-4 sm:py-3 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-3xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-500">
                  <User size={18} />
                </div>
                <div className="hidden md:block text-sm leading-tight text-left">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-slate-500 text-xs dark:text-slate-400">Administrator</p>
                </div>
              </div>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 hidden w-40 rounded-xl border border-slate-200 bg-white shadow-lg group-hover:block z-30 dark:border-slate-800 dark:bg-slate-900">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-slate-100 rounded-xl font-medium dark:hover:bg-slate-800"
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