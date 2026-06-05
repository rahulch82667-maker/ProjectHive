'use client';

import Link from 'next/link';
import { FolderOpen, Heart, ShoppingBag, ArrowRight } from 'lucide-react';

const links = [
  {
    href: '/my-projects',
    icon: FolderOpen,
    label: 'My Projects',
    description: 'View your purchased projects',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    hover: 'hover:bg-amber-50',
  },
  {
    href: '/favorites',
    icon: Heart,
    label: 'Wishlist',
    description: 'Browse your saved items',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    hover: 'hover:bg-rose-50',
  },
  {
    href: '/templates',
    icon: ShoppingBag,
    label: 'Marketplace',
    description: 'Discover new projects',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    hover: 'hover:bg-blue-50',
  },
];

export default function ProfileQuickLinks() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <div className="pb-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">Quick Links</h3>
        <p className="text-xs text-slate-500 mt-0.5">Navigate to key sections</p>
      </div>

      <div className="space-y-2">
        {links.map(({ href, icon: Icon, label, description, color, bg, hover }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors group ${hover}`}
          >
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">{label}</p>
              <p className="text-xs text-slate-500 truncate">{description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}