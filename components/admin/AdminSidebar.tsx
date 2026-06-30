'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { logoutUser } from '@/store/slices/authSlice';
import { logoutApi } from '@/services/auth/auth.api';
import { LayoutDashboard, Users2, FolderOpen, LogOut, KeyRound, X } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users2 },
  { label: 'Projects', href: '/admin/projects', icon: FolderOpen },
  { label: 'Access Requests', href: '/admin/access-requests', icon: KeyRound },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logoutApi();
      await signOut(auth);
      dispatch(logoutUser());
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch(logoutUser());
      router.push('/login');
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white px-6 py-8 transition-transform duration-300 ease-in-out lg:static lg:w-72 xl:w-80 lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        <div className="mb-10">
          <div className="flex justify-center mb-6">
            <Image 
              src="/Images/Hive_logo.png" 
              alt="ProjectHive Logo" 
              width={140} 
              height={140}
              className="object-contain"
              priority
            />
          </div>
          <p className="mt-3 text-sm text-slate-500 text-center dark:text-slate-400">Admin control center for projects, users and analytics.</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                  isActive
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-500'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                }`}
              >
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl transition-colors duration-200 ${
                  isActive
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-500'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-amber-50 group-hover:text-amber-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-amber-950/40 dark:group-hover:text-amber-500'
                }`}>
                  <Icon size={18} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              onClose?.();
              handleLogout();
            }}
            className="group flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30 dark:hover:text-red-500"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600 group-hover:bg-red-100 group-hover:text-red-700 dark:bg-red-950/40 dark:text-red-500">
              <LogOut size={18} />
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}