'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, FileText, FileEdit, Clock, ExternalLink, X } from 'lucide-react';
import { fetchNotifications, NotificationItem, NotificationCounts } from '@/services/admin/notifications.api';

const TYPE_CONFIG = {
  new_project: {
    icon: FileText,
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    iconColor: 'text-emerald-600',
  },
  draft_project: {
    icon: FileEdit,
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    iconColor: 'text-amber-600',
  },
  pending_approval: {
    icon: Clock,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600',
  },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [counts, setCounts] = useState<NotificationCounts | null>(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications);
      setCounts(data.counts);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Poll every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: NotificationItem) => {
    setIsOpen(false);
    router.push(notification.link);
  };

  const totalCount = counts ? counts.total : 0;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications();
        }}
        className="relative inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {totalCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-30 mt-3 w-[calc(100vw-2rem)] sm:w-[380px] origin-top-right rounded-2xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
              {counts && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {counts.newProjects} new · {counts.draftProjects} drafts · {counts.pendingApprovals} pending
                </p>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:text-slate-500"
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 && (
              <div className="flex items-center justify-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-200 border-t-amber-600" />
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Bell size={20} className="text-slate-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">No notifications</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">You're all caught up!</p>
              </div>
            )}

            {notifications.map((notification, index) => {
              const config = TYPE_CONFIG[notification.type];
              const Icon = config.icon;

              return (
                <button
                  key={`${notification.type}-${notification.projectTitle}-${index}`}
                  onClick={() => handleNotificationClick(notification)}
                  className="flex w-full items-start gap-3 px-5 py-3.5 text-left transition hover:bg-slate-50 border-b border-slate-50 last:border-b-0 dark:hover:bg-slate-800/40 dark:border-slate-800/50"
                >
                  {/* Icon */}
                  <div
                    className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.bgColor}`}
                  >
                    <Icon size={16} className={config.iconColor} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {notification.label}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-800 line-clamp-2 dark:text-slate-200">
                      {notification.message}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{timeAgo(notification.createdAt)}</span>
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-amber-600 hover:text-amber-700">
                        View <ExternalLink size={10} />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/admin/access-requests');
                }}
                className="w-full rounded-xl bg-slate-50 py-2 text-center text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}