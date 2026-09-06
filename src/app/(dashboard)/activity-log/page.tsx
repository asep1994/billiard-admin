'use client';

import { Loader2, ShieldAlert } from 'lucide-react';
import { useApiList } from '@/lib/useApiList';
import { Card } from '@/components/ui/Card';
import { formatDate, formatTime } from '@/lib/format';
import type { ActivityAction, ActivityLogEntry } from '@/lib/types';

const ACTION_STYLES: Record<ActivityAction, string> = {
  created: 'bg-primary-soft text-primary',
  updated: 'bg-info-soft text-info',
  deleted: 'bg-danger-soft text-danger',
  cancelled: 'bg-danger-soft text-danger',
  paid: 'bg-primary-soft text-primary',
};

const ACTION_LABELS: Record<ActivityAction, string> = {
  created: 'Dibuat',
  updated: 'Diubah',
  deleted: 'Dihapus',
  cancelled: 'Dibatalkan',
  paid: 'Dibayar',
};

export default function ActivityLogPage() {
  const { data, meta, isLoading, error } = useApiList<ActivityLogEntry>('/activity-logs?per_page=100');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-text">Log Aktivitas</h2>
        <p className="text-sm text-text-muted">{meta?.total ?? 0} aktivitas tercatat</p>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <ShieldAlert className="text-danger" size={24} />
            <p className="text-sm text-danger">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <p className="p-6 text-sm text-text-muted">Belum ada aktivitas tercatat.</p>
        ) : (
          <div className="divide-y divide-border">
            {data.map((entry) => (
              <div key={entry.id} className="flex items-start justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-sm text-text">{entry.description}</p>
                  <p className="mt-1 text-xs text-text-faint">
                    {entry.user?.name ?? 'Sistem'} &middot; {formatDate(entry.created_at)},{' '}
                    {formatTime(entry.created_at)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${ACTION_STYLES[entry.action]}`}
                >
                  {ACTION_LABELS[entry.action]}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
