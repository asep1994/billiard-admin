'use client';

import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useApiList } from '@/lib/useApiList';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatTimeRange } from '@/lib/format';
import type { BilliardTable, Booking, Venue } from '@/lib/types';

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 24;
const DAY_SPAN_HOURS = DAY_END_HOUR - DAY_START_HOUR;

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-warning/80 border-warning',
  confirmed: 'bg-primary/80 border-primary',
  ongoing: 'bg-info/80 border-info',
  completed: 'bg-text-faint/80 border-text-faint',
  cancelled: 'bg-danger/40 border-danger',
};

function todayDateValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function hoursSinceMidnight(iso: string): number {
  const date = new Date(iso);
  return date.getHours() + date.getMinutes() / 60;
}

export default function SchedulePage() {
  const venues = useApiList<Venue>('/venues?per_page=100');
  const tables = useApiList<BilliardTable>('/tables?per_page=100');
  const bookings = useApiList<Booking>('/bookings?per_page=100');

  const [date, setDate] = useState(todayDateValue());
  const [venueId, setVenueId] = useState<number | null>(null);

  const isLoading = venues.isLoading || tables.isLoading || bookings.isLoading;
  const activeVenueId = venueId ?? venues.data[0]?.id ?? null;

  const venueTables = useMemo(
    () => tables.data.filter((table) => table.venue_id === activeVenueId),
    [tables.data, activeVenueId],
  );

  const bookingsByTable = useMemo(() => {
    const map = new Map<number, Booking[]>();

    for (const booking of bookings.data) {
      if (booking.status === 'cancelled') continue;

      const bookingDate = new Date(booking.start_time);
      const bookingDateKey = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}-${String(bookingDate.getDate()).padStart(2, '0')}`;
      if (bookingDateKey !== date) continue;

      const list = map.get(booking.billiard_table_id) ?? [];
      list.push(booking);
      map.set(booking.billiard_table_id, list);
    }

    return map;
  }, [bookings.data, date]);

  const hourMarkers = Array.from({ length: DAY_SPAN_HOURS / 2 + 1 }, (_, i) => DAY_START_HOUR + i * 2);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-text">Jadwal Meja</h2>
          <p className="text-sm text-text-muted">Tampilan jadwal booking per meja untuk tanggal terpilih</p>
        </div>

        <div className="flex gap-3">
          {venues.data.length > 1 && (
            <select
              value={activeVenueId ?? ''}
              onChange={(event) => setVenueId(Number(event.target.value))}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              {venues.data.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
          )}
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : venueTables.length === 0 ? (
        <Card className="p-6 text-sm text-text-muted">Belum ada meja pada venue ini.</Card>
      ) : (
        <Card className="overflow-x-auto p-5">
          <div className="min-w-[720px]">
            <div className="mb-2 flex pl-32">
              {hourMarkers.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 text-xs text-text-faint"
                  style={{ flexBasis: `${(2 / DAY_SPAN_HOURS) * 100}%` }}
                >
                  {String(hour % 24).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {venueTables.map((table) => {
                const tableBookings = bookingsByTable.get(table.id) ?? [];

                return (
                  <div key={table.id} className="flex items-center gap-3">
                    <div className="w-32 shrink-0 pr-3 text-sm font-medium text-text">{table.name}</div>
                    <div className="relative h-11 flex-1 rounded-lg border border-border bg-bg">
                      {hourMarkers.slice(1, -1).map((hour) => (
                        <div
                          key={hour}
                          className="absolute inset-y-0 border-l border-border/60"
                          style={{ left: `${((hour - DAY_START_HOUR) / DAY_SPAN_HOURS) * 100}%` }}
                        />
                      ))}

                      {tableBookings.map((booking) => {
                        const start = Math.max(hoursSinceMidnight(booking.start_time), DAY_START_HOUR);
                        const end = Math.min(hoursSinceMidnight(booking.end_time), DAY_END_HOUR);
                        const left = ((start - DAY_START_HOUR) / DAY_SPAN_HOURS) * 100;
                        const width = Math.max(((end - start) / DAY_SPAN_HOURS) * 100, 2);

                        return (
                          <div
                            key={booking.id}
                            title={`${booking.customer?.name ?? 'Booking'} · ${formatTimeRange(booking.start_time, booking.end_time)} · ${formatCurrency(booking.total_price)}`}
                            className={`absolute inset-y-1 overflow-hidden truncate rounded-md border px-2 text-xs font-medium leading-[2.2rem] text-black ${STATUS_COLORS[booking.status] ?? 'bg-surface-hover border-border'}`}
                            style={{ left: `${left}%`, width: `${width}%` }}
                          >
                            {booking.customer?.name ?? 'Booking'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
