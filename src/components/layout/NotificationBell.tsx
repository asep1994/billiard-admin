'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/format';
import type { AppNotification, Paginated } from '@/lib/types';

interface NotificationsResponse extends Paginated<AppNotification> {
  unread_count: number;
}

const POLL_INTERVAL_MS = 30000;

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    apiFetch<NotificationsResponse>('/notifications?per_page=5')
      .then((res) => {
        setNotifications(res.data);
        setUnreadCount(res.unread_count);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleMarkAsRead(notification: AppNotification) {
    if (notification.read_at) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n)),
    );
    setUnreadCount((count) => Math.max(0, count - 1));

    try {
      await apiFetch(`/notifications/${notification.id}/read`, { method: 'POST' });
    } catch {
      load();
    }
  }

  async function handleMarkAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    setUnreadCount(0);

    try {
      await apiFetch('/notifications/read-all', { method: 'POST' });
    } catch {
      load();
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted hover:bg-surface-hover"
        aria-label="Notifikasi"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-surface shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-text">Notifikasi</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <CheckCheck size={13} />
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-text-muted">Belum ada notifikasi.</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleMarkAsRead(notification)}
                  className={`block w-full border-b border-border px-4 py-3 text-left text-sm transition last:border-b-0 hover:bg-surface-hover ${
                    notification.read_at ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-text">{notification.title}</p>
                    {!notification.read_at && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">{notification.message}</p>
                  <p className="mt-1 text-[11px] text-text-faint">
                    {formatDate(notification.created_at)}, {formatTime(notification.created_at)}
                  </p>
                </button>
              ))
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="block border-t border-border px-4 py-2.5 text-center text-xs font-medium text-primary hover:bg-surface-hover"
          >
            Lihat Semua
          </Link>
        </div>
      )}
    </div>
  );
}
