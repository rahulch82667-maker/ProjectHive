'use client';

import { ShoppingBag, Heart, DollarSign, Clock } from 'lucide-react';
import { ProfileStats as IProfileStats } from '@/store/slices/profileSlice';

interface ProfileStatsProps {
  stats: IProfileStats;
}

const statCards = [
  {
    key: 'totalPurchases' as const,
    label: 'Total Purchases',
    icon: ShoppingBag,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    ring: 'ring-amber-100',
    format: (v: number) => v.toString(),
  },
  {
    key: 'totalSpent' as const,
    label: 'Total Spent',
    icon: DollarSign,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-100',
    format: (v: number) => `$${v.toFixed(2)}`,
  },
  {
    key: 'wishlistCount' as const,
    label: 'Wishlist Items',
    icon: Heart,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    ring: 'ring-rose-100',
    format: (v: number) => v.toString(),
  },
  {
    key: 'pendingOrders' as const,
    label: 'Pending Orders',
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    ring: 'ring-blue-100',
    format: (v: number) => v.toString(),
  },
];

export default function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map(({ key, label, icon: Icon, color, bg, ring, format }) => (
        <div
          key={key}
          className={`relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
        >
          {/* Decorative circle */}
          <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full ${bg} opacity-60`} />

          <div className={`relative w-10 h-10 rounded-xl ${bg} ring-4 ${ring} flex items-center justify-center mb-4`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>

          <p className="text-2xl font-bold text-slate-900 relative">
            {format(stats[key])}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-0.5 relative">{label}</p>
        </div>
      ))}
    </div>
  );
}