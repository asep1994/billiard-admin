'use client';

import Link from 'next/link';
import { Loader2, Plus } from 'lucide-react';
import { useApiList } from '@/lib/useApiList';
import { useAuth } from '@/lib/auth';
import { useActiveVenue } from '@/lib/activeVenue';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/format';
import type { BilliardTable } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
  '8_ball': '8-Ball',
  '9_ball': '9-Ball',
  snooker: 'Snooker',
  carom: 'Carom',
};

export default function TablesPage() {
  const { user } = useAuth();
  const { activeVenueId, isLoading: venueLoading } = useActiveVenue();
  const waitingForVenue = Boolean(user?.vendor_id) && venueLoading;

  const path = waitingForVenue
    ? null
    : `/tables?per_page=100${activeVenueId ? `&venue_id=${activeVenueId}` : ''}`;
  const { data, meta, isLoading, error } = useApiList<BilliardTable>(path);
  const canManage = user?.role === 'super_admin' || user?.role === 'vendor_admin';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text">Meja Billiard</h2>
          <p className="text-sm text-text-muted">{meta?.total ?? 0} meja terdaftar</p>
        </div>
        {canManage && (
          <Link
            href="/tables/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary-dark"
          >
            <Plus size={16} />
            Tambah Meja
          </Link>
        )}
      </div>

      {isLoading || waitingForVenue ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : data.length === 0 ? (
        <Card className="p-6 text-sm text-text-muted">Belum ada meja terdaftar.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((table) => {
            const content = (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-text">{table.name}</p>
                    <p className="text-xs text-text-faint">{table.venue?.name ?? 'Venue tidak diketahui'}</p>
                  </div>
                  <StatusBadge status={table.status} />
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-text-muted">{TYPE_LABELS[table.type] ?? table.type}</span>
                  <span className="font-medium text-text">{formatCurrency(table.hourly_rate)} / jam</span>
                </div>
              </>
            );

            return canManage ? (
              <Link key={table.id} href={`/tables/${table.id}/edit`}>
                <Card className="p-5 transition hover:border-primary/50">{content}</Card>
              </Link>
            ) : (
              <Card key={table.id} className="p-5">
                {content}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
