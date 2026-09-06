'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { formatDate, formatTime } from '@/lib/format';
import type { AppNotification, Paginated } from '@/lib/types';

interface NotificationsResponse extends Paginated<AppNotification> {
  unread_count: number;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    apiFetch<NotificationsResponse>('/notifications?per_page=100')
      .then((res) => {
        setNotifications(res.data);
        setUnreadCount(res.unread_count);
      })
      .catch(() => setError('Gagal memuat notifikasi.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, the standard data-fetching effect shape
    load();
  }, [load]);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text">Notifikasi</h2>
          <p className="text-sm text-text-muted">{unreadCount} belum dibaca</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:bg-surface-hover"
          >
            <CheckCheck size={15} />
            Tandai semua dibaca
          </button>
        )}
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-danger">{error}</p>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Bell className="text-text-faint" size={24} />
            <p className="text-sm text-text-muted">Belum ada notifikasi.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleMarkAsRead(notification)}
                className={`flex w-full items-start justify-between gap-3 px-5 py-4 text-left transition hover:bg-surface-hover ${
                  notification.read_at ? 'opacity-60' : ''
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-text">{notification.title}</p>
                  <p className="mt-0.5 text-sm text-text-muted">{notification.message}</p>
                  <p className="mt-1 text-xs text-text-faint">
                    {formatDate(notification.created_at)}, {formatTime(notification.created_at)}
                  </p>
                </div>
                {!notification.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
