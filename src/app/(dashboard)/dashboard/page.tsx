'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { CalendarCheck, Grid3x3, Loader2, Plus, TrendingUp, Users } from 'lucide-react';
import { useApiList } from '@/lib/useApiList';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { TableStatusChart } from '@/components/charts/TableStatusChart';
import {
  formatCurrency,
  formatDate,
  formatShortDate,
  formatTimeRange,
  isSameDay,
} from '@/lib/format';
import type { BilliardTable, Booking, Customer } from '@/lib/types';

const CANCELLED = 'cancelled';
const ACTIVE_OCCUPANCY_STATUSES = ['confirmed', 'ongoing'];

export default function DashboardPage() {
  const bookings = useApiList<Booking>('/bookings?per_page=100');
  const tables = useApiList<BilliardTable>('/tables?per_page=100');
  const customers = useApiList<Customer>('/customers?per_page=1');

  const isLoading = bookings.isLoading || tables.isLoading || customers.isLoading;

  const stats = useMemo(() => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const nonCancelled = bookings.data.filter((booking) => booking.status !== CANCELLED);

    const bookingsToday = nonCancelled.filter((booking) => isSameDay(new Date(booking.start_time), now));
    const bookingsYesterday = nonCancelled.filter((booking) =>
      isSameDay(new Date(booking.start_time), yesterday),
    );

    const revenueToday = bookingsToday.reduce((sum, booking) => sum + parseFloat(booking.total_price), 0);
    const revenueYesterday = bookingsYesterday.reduce(
      (sum, booking) => sum + parseFloat(booking.total_price),
      0,
    );

    const occupiedTableIds = new Set(
      nonCancelled
        .filter(
          (booking) =>
            ACTIVE_OCCUPANCY_STATUSES.includes(booking.status) &&
            new Date(booking.start_time) <= now &&
            new Date(booking.end_time) >= now,
        )
        .map((booking) => booking.billiard_table_id),
    );

    const availableTables = tables.data.filter((table) => table.status === 'available');
    const occupiedCount = availableTables.filter((table) => occupiedTableIds.has(table.id)).length;
    const maintenanceCount = tables.data.filter((table) => table.status === 'maintenance').length;
    const inactiveCount = tables.data.filter((table) => table.status === 'inactive').length;
    const freeCount = availableTables.length - occupiedCount;
    const totalTables = tables.data.length;

    const revenueByDay: { label: string; total: number }[] = Array.from({ length: 7 }).map((_, index) => {
      const day = new Date(now);
      day.setDate(day.getDate() - (6 - index));

      const total = nonCancelled
        .filter((booking) => isSameDay(new Date(booking.start_time), day))
        .reduce((sum, booking) => sum + parseFloat(booking.total_price), 0);

      return { label: formatShortDate(day.toISOString()), total };
    });

    const recentBookings = [...bookings.data]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    const upcomingBookings = nonCancelled
      .filter((booking) => new Date(booking.start_time) > now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 5);

    return {
      bookingsTodayCount: bookingsToday.length,
      bookingsYesterdayCount: bookingsYesterday.length,
      revenueToday,
      revenueYesterday,
      totalTables,
      occupiedCount,
      freeCount,
      maintenanceCount,
      inactiveCount,
      occupancyPercent: totalTables > 0 ? Math.round((occupiedCount / totalTables) * 100) : 0,
      revenueByDay,
      recentBookings,
      upcomingBookings,
    };
  }, [bookings.data, tables.data]);

  const bookingTrend = trendOf(stats.bookingsTodayCount, stats.bookingsYesterdayCount);
  const revenueTrend = trendOf(stats.revenueToday, stats.revenueYesterday);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Booking Hari Ini"
          value={String(stats.bookingsTodayCount)}
          icon={CalendarCheck}
          trend={bookingTrend}
        />
        <StatCard
          label="Pelanggan"
          value={String(customers.meta?.total ?? 0)}
          icon={Users}
          iconClassName="bg-info-soft text-info"
        />
        <StatCard
          label="Meja Terpakai"
          value={`${stats.occupancyPercent}%`}
          icon={Grid3x3}
          iconClassName="bg-warning-soft text-warning"
        />
        <StatCard
          label="Omzet Hari Ini"
          value={formatCurrency(stats.revenueToday)}
          icon={TrendingUp}
          trend={revenueTrend}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">Grafik Omzet</h2>
            <span className="text-xs text-text-faint">7 Hari Terakhir</span>
          </div>
          <RevenueChart data={stats.revenueByDay} />
        </Card>

        <Card className="p-5">
          <h2 className="mb-2 text-sm font-semibold text-text">Status Meja</h2>
          <TableStatusChart
            total={stats.totalTables}
            segments={[
              { label: 'Tersedia', value: stats.freeCount, color: '#22c55e' },
              { label: 'Terpakai', value: stats.occupiedCount, color: '#f59e0b' },
              { label: 'Maintenance', value: stats.maintenanceCount, color: '#ef4444' },
              { label: 'Nonaktif', value: stats.inactiveCount, color: '#5b6270' },
            ]}
          />
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <LegendItem color="#22c55e" label="Tersedia" value={stats.freeCount} />
            <LegendItem color="#f59e0b" label="Terpakai" value={stats.occupiedCount} />
            <LegendItem color="#ef4444" label="Maintenance" value={stats.maintenanceCount} />
            <LegendItem color="#5b6270" label="Nonaktif" value={stats.inactiveCount} />
          </div>
          <Link
            href="/tables"
            className="mt-4 flex items-center justify-center rounded-lg border border-border py-2 text-sm text-text-muted hover:bg-surface-hover hover:text-text"
          >
            Kelola Meja
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-text">Booking Terbaru</h2>
            <Link href="/bookings" className="text-xs font-medium text-primary hover:underline">
              Lihat Semua
            </Link>
          </div>

          {stats.recentBookings.length === 0 ? (
            <p className="p-6 text-sm text-text-muted">Belum ada booking.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-surface-hover text-xs uppercase tracking-wide text-text-faint">
                  <tr>
                    <th className="px-4 py-3 font-medium">Kode</th>
                    <th className="px-4 py-3 font-medium">Meja</th>
                    <th className="px-4 py-3 font-medium">Pelanggan</th>
                    <th className="px-4 py-3 font-medium">Tanggal</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-surface-hover">
                      <td className="px-4 py-3 font-medium text-text">
                        BK-{String(booking.id).padStart(4, '0')}
                      </td>
                      <td className="px-4 py-3 text-text-muted">{booking.billiard_table?.name ?? '-'}</td>
                      <td className="px-4 py-3 text-text-muted">{booking.customer?.name ?? '-'}</td>
                      <td className="px-4 py-3 text-text-muted">{formatDate(booking.start_time)}</td>
                      <td className="px-4 py-3 font-medium text-text">
                        {formatCurrency(booking.total_price)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={booking.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-text">Booking Mendatang</h2>
            <Link href="/bookings" className="text-xs font-medium text-primary hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="flex-1 divide-y divide-border">
            {stats.upcomingBookings.length === 0 ? (
              <p className="p-5 text-sm text-text-muted">Tidak ada booking mendatang.</p>
            ) : (
              stats.upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">
                      {booking.billiard_table?.name ?? 'Meja'}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                      {formatTimeRange(booking.start_time, booking.end_time)} &middot;{' '}
                      {booking.customer?.name ?? '-'}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border p-4">
            <Link
              href="/bookings/new"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-black hover:bg-primary-dark"
            >
              <Plus size={16} />
              Booking Baru
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-text-muted">{label}</span>
      <span className="ml-auto font-medium text-text">{value}</span>
    </div>
  );
}

function trendOf(current: number, previous: number): { value: string; direction: 'up' | 'down'; suffix: string } | undefined {
  if (previous === 0 && current === 0) return undefined;
  if (previous === 0) return { value: '100%', direction: 'up', suffix: 'dari kemarin' };

  const percent = Math.round(((current - previous) / previous) * 100);

  return {
    value: `${Math.abs(percent)}%`,
    direction: percent >= 0 ? 'up' : 'down',
    suffix: 'dari kemarin',
  };
}
