'use client';

import { Calendar, Shield, Package, BookMarked } from 'lucide-react';
import { UserProfile } from '@/store/slices/profileSlice';

interface ProfileInfoProps {
  profile: UserProfile;
}

export default function ProfileInfo({ profile }: ProfileInfoProps) {
  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const rows = [
    {
      icon: Calendar,
      label: 'Member Since',
      value: joinDate,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      icon: Shield,
      label: 'Account Role',
      value: profile.role.charAt(0).toUpperCase() + profile.role.slice(1),
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Package,
      label: 'Projects Owned',
      value: `${profile.purchasedCount} project${profile.purchasedCount !== 1 ? 's' : ''}`,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: BookMarked,
      label: 'Wishlist',
      value: `${profile.wishlistCount} saved item${profile.wishlistCount !== 1 ? 's' : ''}`,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
      <div className="pb-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">Account Details</h3>
        <p className="text-xs text-slate-500 mt-0.5">Your account information at a glance</p>
      </div>

      <div className="space-y-4">
        {rows.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}