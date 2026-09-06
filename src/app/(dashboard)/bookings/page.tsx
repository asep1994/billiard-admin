'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, CreditCard, Loader2, Plus, Search, X } from 'lucide-react';
import { useApiList } from '@/lib/useApiList';
import { useAuth } from '@/lib/auth';
import { useActiveVenue } from '@/lib/activeVenue';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate, formatDuration, formatTimeRange } from '@/lib/format';
import type { Booking } from '@/lib/types';

function CreatedBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!searchParams.get('created')) return null;

  return (
    <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary-soft px-4 py-3 text-sm text-primary">
      <span className="flex items-center gap-2">
        <CheckCircle2 size={16} />
        Booking baru berhasil dibuat.
      </span>
      <button onClick={() => router.replace('/bookings')} aria-label="Tutup">
        <X size={16} />
      </button>
    </div>
  );
}

export default function BookingsPage() {
  const { user } = useAuth();
  const { activeVenueId, isLoading: venueLoading } = useActiveVenue();
  const waitingForVenue = Boolean(user?.vendor_id) && venueLoading;

  const path = waitingForVenue
    ? null
    : `/bookings?per_page=100${activeVenueId ? `&venue_id=${activeVenueId}` : ''}`;
  const { data, meta, isLoading, error } = useApiList<Booking>(path);
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
      <Suspense fallback={null}>
        <CreatedBanner />
      </Suspense>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-text">Semua Booking</h2>
          <p className="text-sm text-text-muted">{meta?.total ?? 0} total booking</p>
        </div>

        <div className="flex w-full gap-3 sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari pelanggan atau meja..."
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text outline-none focus:border-primary"
            />
          </div>
          <Link
            href="/bookings/new"
            className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary-dark"
          >
            <Plus size={16} />
            Booking Baru
          </Link>
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading || waitingForVenue ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-danger">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-text-muted">Tidak ada booking ditemukan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
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
                  <th className="px-4 py-3 font-medium" />
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
                    <td className="px-4 py-3 font-medium text-text">
                      {formatCurrency(booking.payable_amount)}
                      {parseFloat(booking.discount_amount) > 0 && (
                        <span className="block text-xs font-normal text-primary">
                          Promo {booking.promotion?.code} -{formatCurrency(booking.discount_amount)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={booking.payment_status} />
                    </td>
                    <td className="px-4 py-3">
                      {booking.payment_status !== 'paid' && booking.status !== 'cancelled' && (
                        <Link
                          href={`/bookings/${booking.id}/pay`}
                          className="flex items-center gap-1.5 rounded-lg border border-primary/30 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary-soft"
                        >
                          <CreditCard size={13} />
                          Bayar
                        </Link>
                      )}
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
