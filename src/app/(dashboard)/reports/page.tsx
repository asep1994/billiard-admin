'use client';

import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useApiList } from '@/lib/useApiList';
import { Card } from '@/components/ui/Card';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { formatCurrency, formatShortDate } from '@/lib/format';
import type { BilliardTable, Booking } from '@/lib/types';

function daysAgoValue(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function todayValue(): string {
  return daysAgoValue(0);
}

function toDateKey(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function ReportsPage() {
  const bookings = useApiList<Booking>('/bookings?per_page=100');
  const tables = useApiList<BilliardTable>('/tables?per_page=100');
  const [from, setFrom] = useState(daysAgoValue(29));
  const [to, setTo] = useState(todayValue());

  const isLoading = bookings.isLoading || tables.isLoading;

  const report = useMemo(() => {
    const inRange = bookings.data.filter((booking) => {
      const key = toDateKey(booking.start_time);
      return key >= from && key <= to;
    });

    const nonCancelled = inRange.filter((booking) => booking.status !== 'cancelled');
    const cancelled = inRange.filter((booking) => booking.status === 'cancelled');

    const totalRevenue = nonCancelled.reduce((sum, booking) => sum + parseFloat(booking.total_price), 0);
    const averageValue = nonCancelled.length > 0 ? totalRevenue / nonCancelled.length : 0;
    const cancellationRate = inRange.length > 0 ? (cancelled.length / inRange.length) * 100 : 0;

    const revenueByDay = new Map<string, number>();
    for (const booking of nonCancelled) {
      const key = toDateKey(booking.start_time);
      revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + parseFloat(booking.total_price));
    }

    const sortedDays = Array.from(revenueByDay.keys()).sort();
    const chartData = sortedDays.map((key) => ({
      label: formatShortDate(key),
      total: revenueByDay.get(key) ?? 0,
    }));

    const revenueByTable = new Map<number, { revenue: number; count: number }>();
    for (const booking of nonCancelled) {
      const current = revenueByTable.get(booking.billiard_table_id) ?? { revenue: 0, count: 0 };
      current.revenue += parseFloat(booking.total_price);
      current.count += 1;
      revenueByTable.set(booking.billiard_table_id, current);
    }

    const tableBreakdown = Array.from(revenueByTable.entries())
      .map(([tableId, stats]) => ({
        tableId,
        table: tables.data.find((table) => table.id === tableId),
        ...stats,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalRevenue,
      totalBookings: nonCancelled.length,
      averageValue,
      cancellationRate,
      chartData,
      tableBreakdown,
    };
  }, [bookings.data, tables.data, from, to]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-text">Laporan</h2>
          <p className="text-sm text-text-muted">Ringkasan performa bisnis pada rentang tanggal terpilih</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <span className="text-text-faint">-</span>
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="p-5">
              <p className="text-sm text-text-muted">Total Omzet</p>
              <p className="text-xl font-semibold text-text">{formatCurrency(report.totalRevenue)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-text-muted">Total Booking</p>
              <p className="text-xl font-semibold text-text">{report.totalBookings}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-text-muted">Rata-rata / Booking</p>
              <p className="text-xl font-semibold text-text">{formatCurrency(report.averageValue)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-text-muted">Tingkat Pembatalan</p>
              <p className="text-xl font-semibold text-text">{report.cancellationRate.toFixed(1)}%</p>
            </Card>
          </div>

          <Card className="p-5">
            <h3 className="mb-2 text-sm font-semibold text-text">Grafik Omzet</h3>
            {report.chartData.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">Tidak ada data pada rentang ini.</p>
            ) : (
              <RevenueChart data={report.chartData} />
            )}
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h3 className="text-sm font-semibold text-text">Meja Paling Produktif</h3>
            </div>
            {report.tableBreakdown.length === 0 ? (
              <p className="p-6 text-sm text-text-muted">Belum ada booking pada rentang ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="bg-surface-hover text-xs uppercase tracking-wide text-text-faint">
                    <tr>
                      <th className="px-4 py-3 font-medium">Meja</th>
                      <th className="px-4 py-3 font-medium">Jumlah Booking</th>
                      <th className="px-4 py-3 font-medium">Omzet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {report.tableBreakdown.map((row) => (
                      <tr key={row.tableId} className="hover:bg-surface-hover">
                        <td className="px-4 py-3 font-medium text-text">{row.table?.name ?? 'Meja dihapus'}</td>
                        <td className="px-4 py-3 text-text-muted">{row.count}</td>
                        <td className="px-4 py-3 font-medium text-text">{formatCurrency(row.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
