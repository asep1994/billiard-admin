'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate, formatTimeRange } from '@/lib/format';
import type { Booking, Payment } from '@/lib/types';

const METHOD_OPTIONS = [
  { value: 'VC', label: 'Kartu Kredit' },
  { value: 'BT', label: 'VA Permata' },
  { value: 'M2', label: 'QRIS' },
  { value: 'OV', label: 'OVO' },
  { value: 'SP', label: 'ShopeePay' },
];

export default function PayBookingPage() {
  const params = useParams<{ id: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState('VC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<{ paymentUrl: string | null; merchantOrderId: string } | null>(null);

  useEffect(() => {
    apiFetch<{ data: Booking }>(`/bookings/${params.id}`)
      .then((res) => setBooking(res.data))
      .catch((err: unknown) => setLoadError(err instanceof ApiError ? err.message : 'Gagal memuat booking.'));
  }, [params.id]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const response = await apiFetch<{ data: Payment; payment_url: string | null }>(
        `/bookings/${params.id}/pay`,
        { method: 'POST', body: JSON.stringify({ payment_method: paymentMethod }) },
      );

      setResult({ paymentUrl: response.payment_url, merchantOrderId: response.data.merchant_order_id });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Gagal membuat transaksi pembayaran.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link href="/bookings" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Kembali ke Booking
      </Link>

      {loadError ? (
        <p className="text-sm text-danger">{loadError}</p>
      ) : !booking ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (
        <>
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold text-text">BK-{String(booking.id).padStart(4, '0')}</p>
              <StatusBadge status={booking.payment_status} />
            </div>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Pelanggan</dt>
                <dd className="text-text">{booking.customer?.name ?? '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Meja</dt>
                <dd className="text-text">{booking.billiard_table?.name ?? '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Jadwal</dt>
                <dd className="text-text">
                  {formatDate(booking.start_time)}, {formatTimeRange(booking.start_time, booking.end_time)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <dt className="text-text-muted">Total</dt>
                <dd className="font-semibold text-text">{formatCurrency(booking.total_price)}</dd>
              </div>
            </dl>
          </Card>

          {booking.payment_status === 'paid' ? (
            <Card className="flex items-center gap-2 p-5 text-sm text-primary">
              <CheckCircle2 size={18} />
              Booking ini sudah lunas.
            </Card>
          ) : result ? (
            <Card className="space-y-3 p-5">
              <p className="text-sm text-text-muted">
                Transaksi <span className="text-text">{result.merchantOrderId}</span> berhasil dibuat.
              </p>
              {result.paymentUrl ? (
                <a
                  href={result.paymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-black hover:bg-primary-dark"
                >
                  <ExternalLink size={16} />
                  Buka Halaman Pembayaran
                </a>
              ) : (
                <p className="text-sm text-danger">Duitku tidak mengembalikan tautan pembayaran.</p>
              )}
              <p className="text-xs text-text-faint">
                Status booking akan otomatis ter-update ke &quot;Lunas&quot; setelah Duitku mengonfirmasi
                pembayaran.
              </p>
            </Card>
          ) : (
            <form onSubmit={handleSubmit}>
              <Card className="space-y-4 p-5">
                {formError && (
                  <div className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm text-text-muted">Metode Pembayaran</label>
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
                  >
                    {METHOD_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Buat Transaksi
                </button>
              </Card>
            </form>
          )}
        </>
      )}
    </div>
  );
}
