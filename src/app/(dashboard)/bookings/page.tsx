'use client';

import { useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { useApiList } from '@/lib/useApiList';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate, formatDuration, formatTimeRange } from '@/lib/format';
import type { Booking } from '@/lib/types';

export default function BookingsPage() {
  const { data, meta, isLoading, error } = useApiList<Booking>('/bookings?per_page=100');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data;

    return data.filter((booking) =>
      [booking.customer?.name, booking.billiard_table?.name, booking.venue?.name]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [data, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-text">Semua Booking</h2>
          <p className="text-sm text-text-muted">{meta?.total ?? 0} total booking</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari pelanggan atau meja..."
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text outline-none focus:border-primary"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-danger">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-text-muted">Tidak ada booking ditemukan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-surface-hover text-xs uppercase tracking-wide text-text-faint">
                <tr>
                  <th className="px-4 py-3 font-medium">Kode</th>
                  <th className="px-4 py-3 font-medium">Meja</th>
                  <th className="px-4 py-3 font-medium">Pelanggan</th>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Jam</th>
                  <th className="px-4 py-3 font-medium">Durasi</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Pembayaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((booking) => (
                  <tr key={booking.id} className="hover:bg-surface-hover">
                    <td className="px-4 py-3 font-medium text-text">BK-{String(booking.id).padStart(4, '0')}</td>
                    <td className="px-4 py-3 text-text-muted">
                      {booking.billiard_table?.name ?? '-'}
                      {booking.venue?.name && (
                        <span className="block text-xs text-text-faint">{booking.venue.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {booking.customer?.name ?? '-'}
                      {booking.customer?.phone && (
                        <span className="block text-xs text-text-faint">{booking.customer.phone}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{formatDate(booking.start_time)}</td>
                    <td className="px-4 py-3 text-text-muted">
                      {formatTimeRange(booking.start_time, booking.end_time)}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {formatDuration(booking.start_time, booking.end_time)}
                    </td>
                    <td className="px-4 py-3 font-medium text-text">{formatCurrency(booking.total_price)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={booking.payment_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
