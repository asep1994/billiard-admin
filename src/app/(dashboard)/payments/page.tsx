'use client';

import { useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { useApiList } from '@/lib/useApiList';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import type { Payment } from '@/lib/types';

const METHOD_LABELS: Record<string, string> = {
  VC: 'Kartu Kredit',
  BT: 'VA Permata',
  M2: 'QRIS',
  OV: 'OVO',
  SP: 'ShopeePay',
};

export default function PaymentsPage() {
  const { data, meta, isLoading, error } = useApiList<Payment>('/payments?per_page=100');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data;

    return data.filter((payment) =>
      [payment.booking?.customer?.name, payment.merchant_order_id, payment.duitku_reference]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [data, search]);

  const totalPaid = data
    .filter((payment) => payment.status === 'paid')
    .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-text-muted">Total Transaksi</p>
          <p className="text-xl font-semibold text-text">{meta?.total ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-text-muted">Total Diterima (Lunas)</p>
          <p className="text-xl font-semibold text-primary">{formatCurrency(totalPaid)}</p>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-text">Riwayat Pembayaran</h2>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari pelanggan atau referensi..."
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
          <p className="p-6 text-sm text-text-muted">Belum ada transaksi pembayaran.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-surface-hover text-xs uppercase tracking-wide text-text-faint">
                <tr>
                  <th className="px-4 py-3 font-medium">Booking</th>
                  <th className="px-4 py-3 font-medium">Pelanggan</th>
                  <th className="px-4 py-3 font-medium">Meja</th>
                  <th className="px-4 py-3 font-medium">Metode</th>
                  <th className="px-4 py-3 font-medium">Jumlah</th>
                  <th className="px-4 py-3 font-medium">Referensi</th>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((payment) => (
                  <tr key={payment.id} className="hover:bg-surface-hover">
                    <td className="px-4 py-3 font-medium text-text">
                      BK-{String(payment.booking_id).padStart(4, '0')}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{payment.booking?.customer?.name ?? '-'}</td>
                    <td className="px-4 py-3 text-text-muted">{payment.booking?.billiard_table?.name ?? '-'}</td>
                    <td className="px-4 py-3 text-text-muted">
                      {METHOD_LABELS[payment.payment_method] ?? payment.payment_method}
                    </td>
                    <td className="px-4 py-3 font-medium text-text">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-3 text-xs text-text-faint">{payment.duitku_reference ?? '-'}</td>
                    <td className="px-4 py-3 text-text-muted">
                      {formatDate(payment.created_at)}
                      <span className="block text-xs text-text-faint">{formatTime(payment.created_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={payment.status} />
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
