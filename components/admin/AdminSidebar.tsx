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
import { LayoutDashboard, Users2, FolderOpen, ShieldCheck, LogOut, Image as ImageIcon } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users2 },
  { label: 'Projects', href: '/admin/projects', icon: FolderOpen },
  { label: 'Photos', href: '/admin/photos', icon: ImageIcon },
  { label: 'Security', href: '/admin/security', icon: ShieldCheck },
];

export default function AdminSidebar() {
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
    <aside className="hidden lg:flex lg:w-72 xl:w-80 flex-col border-r border-slate-200 bg-white px-6 py-8">
      <div className="mb-10">
        <div className="flex justify-center mb-6">
          <Image 
            src="/Images/Hive_logo.png" 
            alt="ProjectHive Logo" 
            width={140} 
            height={140}
            className="object-contain"
          />
        </div>
        <p className="mt-3 text-sm text-slate-500 text-center">Admin control center for projects, users and analytics.</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                isActive
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl transition-colors duration-200 ${
                isActive
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-600 group-hover:bg-amber-50 group-hover:text-amber-700'
              }`}>
                <Icon size={18} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-700"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600 group-hover:bg-red-100 group-hover:text-red-700">
            <LogOut size={18} />
          </span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}