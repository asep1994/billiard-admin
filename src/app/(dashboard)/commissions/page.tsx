'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApiList } from '@/lib/useApiList';
import { Card } from '@/components/ui/Card';
import { FieldError } from '@/components/ui/FieldError';
import { formatCurrency, formatDate } from '@/lib/format';
import type { CommissionSummary, Payout } from '@/lib/types';

function VendorRow({
  summary,
  canManage,
  onChanged,
}: {
  summary: CommissionSummary;
  canManage: boolean;
  onChanged: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rate, setRate] = useState(String(summary.commission_rate));
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSavingRate, setIsSavingRate] = useState(false);
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  const outstanding = parseFloat(summary.outstanding_balance);

  async function handleSaveRate() {
    setFormError(null);
    setIsSavingRate(true);

    try {
      await apiFetch(`/vendors/${summary.vendor_id}`, {
        method: 'PUT',
        body: JSON.stringify({ commission_rate: Number(rate) }),
      });
      onChanged();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Gagal menyimpan komisi.');
    } finally {
      setIsSavingRate(false);
    }
  }

  async function handleSubmitPayout(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmittingPayout(true);

    try {
      await apiFetch('/payouts', {
        method: 'POST',
        body: JSON.stringify({ vendor_id: summary.vendor_id, amount: Number(amount), note: note || undefined }),
      });
      setAmount('');
      setNote('');
      setExpanded(false);
      onChanged();
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.errors ?? {});
        setFormError(err.message);
      } else {
        setFormError('Gagal mencatat payout.');
      }
    } finally {
      setIsSubmittingPayout(false);
    }
  }

  return (
    <>
      <tr className="hover:bg-surface-hover">
        <td className="px-4 py-3 font-medium text-text">{summary.vendor_name}</td>
        <td className="px-4 py-3 text-text-muted">{summary.commission_rate}%</td>
        <td className="px-4 py-3 text-text-muted">{formatCurrency(summary.gross_revenue)}</td>
        <td className="px-4 py-3 text-text-muted">{formatCurrency(summary.commission_earned)}</td>
        <td className="px-4 py-3 text-text-muted">{formatCurrency(summary.paid_out)}</td>
        <td className="px-4 py-3 font-medium text-text">{formatCurrency(summary.outstanding_balance)}</td>
        <td className="px-4 py-3">
          {canManage && (
            <button
              onClick={() => setExpanded((value) => !value)}
              className="rounded-lg border border-primary/30 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary-soft"
            >
              Kelola
            </button>
          )}
        </td>
      </tr>
      {expanded && canManage && (
        <tr>
          <td colSpan={7} className="bg-bg px-4 py-4">
            {formError && <p className="mb-3 text-sm text-danger">{formError}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-text-muted">Ubah Komisi (%)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={rate}
                    onChange={(event) => setRate(event.target.value)}
                    className="w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleSaveRate}
                    disabled={isSavingRate}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-text hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingRate && <Loader2 size={14} className="animate-spin" />}
                    Simpan
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitPayout} className="space-y-2">
                <label className="block text-xs font-medium text-text-muted">
                  Catat Payout &middot; saldo tertunda {formatCurrency(summary.outstanding_balance)}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max={outstanding}
                    step="1000"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="Jumlah"
                    className="w-32 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
                  />
                  <input
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Catatan (opsional)"
                    className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingPayout}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-black hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmittingPayout && <Loader2 size={14} className="animate-spin" />}
                    Bayar
                  </button>
                </div>
                <FieldError messages={fieldErrors.amount} />
              </form>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function CommissionsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [summaries, setSummaries] = useState<CommissionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummaries = useCallback(() => {
    setIsLoading(true);
    apiFetch<{ data: CommissionSummary[] }>('/commissions')
      .then((res) => setSummaries(res.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Gagal memuat data komisi.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, the standard data-fetching effect shape
    loadSummaries();
  }, [loadSummaries]);

  const payouts = useApiList<Payout>('/payouts?per_page=100');

  function handleChanged() {
    loadSummaries();
    payouts.refetch();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-text">Komisi & Payout</h2>
        <p className="text-sm text-text-muted">
          {isSuperAdmin ? 'Ringkasan komisi platform per vendor' : 'Ringkasan komisi dan payout vendor Anda'}
        </p>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-danger">{error}</p>
        ) : summaries.length === 0 ? (
          <p className="p-6 text-sm text-text-muted">Belum ada data komisi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-surface-hover text-xs uppercase tracking-wide text-text-faint">
                <tr>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">Komisi</th>
                  <th className="px-4 py-3 font-medium">Omzet</th>
                  <th className="px-4 py-3 font-medium">Komisi Platform</th>
                  <th className="px-4 py-3 font-medium">Sudah Dibayar</th>
                  <th className="px-4 py-3 font-medium">Belum Dibayar</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summaries.map((summary) => (
                  <VendorRow key={summary.vendor_id} summary={summary} canManage={isSuperAdmin} onChanged={handleChanged} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-text">Riwayat Payout</h3>
        <Card className="overflow-hidden">
          {payouts.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : payouts.data.length === 0 ? (
            <p className="p-6 text-sm text-text-muted">Belum ada payout tercatat.</p>
          ) : (
            <div className="divide-y divide-border">
              {payouts.data.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-text">{payout.vendor?.name ?? `Vendor #${payout.vendor_id}`}</p>
                    {payout.note && <p className="text-sm text-text-muted">{payout.note}</p>}
                    <p className="mt-1 text-xs text-text-faint">
                      {payout.recorded_by?.name ?? 'Sistem'} &middot; {formatDate(payout.paid_at)}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-text">{formatCurrency(payout.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
