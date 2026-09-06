'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { FieldError } from '@/components/ui/FieldError';
import type { Promotion, PromotionType } from '@/lib/types';

function toDateInputValue(value: string | null): string {
  if (!value) return '';
  return value.slice(0, 10);
}

export function PromotionForm({ promotion }: { promotion?: Promotion }) {
  const router = useRouter();
  const isEdit = Boolean(promotion);

  const [code, setCode] = useState(promotion?.code ?? '');
  const [type, setType] = useState<PromotionType>(promotion?.type ?? 'percentage');
  const [value, setValue] = useState(promotion?.value ?? '');
  const [maxDiscount, setMaxDiscount] = useState(promotion?.max_discount ?? '');
  const [startsAt, setStartsAt] = useState(toDateInputValue(promotion?.starts_at ?? null));
  const [expiresAt, setExpiresAt] = useState(toDateInputValue(promotion?.expires_at ?? null));
  const [usageLimit, setUsageLimit] = useState(promotion?.usage_limit ? String(promotion.usage_limit) : '');
  const [isActive, setIsActive] = useState(promotion?.is_active ?? true);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    const payload = {
      code,
      type,
      value,
      max_discount: maxDiscount || undefined,
      starts_at: startsAt || undefined,
      expires_at: expiresAt || undefined,
      usage_limit: usageLimit || undefined,
      is_active: isActive,
    };

    try {
      if (isEdit && promotion) {
        await apiFetch(`/promotions/${promotion.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/promotions', { method: 'POST', body: JSON.stringify(payload) });
      }

      router.push('/promotions');
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.errors ?? {});
        setFormError(err.message);
      } else {
        setFormError('Gagal menyimpan promo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!promotion) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await apiFetch(`/promotions/${promotion.id}`, { method: 'DELETE' });
      router.push('/promotions');
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Gagal menghapus promo.');
      setIsDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-4">
      {formError && (
        <div className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          {formError}
        </div>
      )}

      <Card className="space-y-4 p-5">
        <div>
          <label className="mb-1 block text-sm text-text-muted">Kode Promo</label>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="DISKON20"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm uppercase text-text outline-none focus:border-primary"
          />
          <FieldError messages={fieldErrors.code} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-text-muted">Tipe Diskon</label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as PromotionType)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              <option value="percentage">Persentase (%)</option>
              <option value="fixed">Nominal Tetap (Rp)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted">
              {type === 'percentage' ? 'Nilai (%)' : 'Nilai (Rp)'}
            </label>
            <input
              type="number"
              min="0"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            <FieldError messages={fieldErrors.value} />
          </div>
        </div>

        {type === 'percentage' && (
          <div>
            <label className="mb-1 block text-sm text-text-muted">Maks. Diskon (Rp, opsional)</label>
            <input
              type="number"
              min="0"
              value={maxDiscount}
              onChange={(event) => setMaxDiscount(event.target.value)}
              placeholder="Tanpa batas"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            <FieldError messages={fieldErrors.max_discount} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-text-muted">Mulai Berlaku (opsional)</label>
            <input
              type="date"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted">Berakhir (opsional)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            <FieldError messages={fieldErrors.expires_at} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-text-muted">Batas Pemakaian (opsional)</label>
          <input
            type="number"
            min="1"
            value={usageLimit}
            onChange={(event) => setUsageLimit(event.target.value)}
            placeholder="Tanpa batas"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          {isEdit && (
            <p className="mt-1 text-xs text-text-faint">Sudah dipakai {promotion?.times_used ?? 0} kali.</p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          Aktif
        </label>
      </Card>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isEdit ? 'Simpan Perubahan' : 'Tambah Promo'}
      </button>

      {isEdit && (
        <Card className="space-y-3 border-danger/30 p-5">
          {deleteError && <p className="text-sm text-danger">{deleteError}</p>}

          {!confirmingDelete ? (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="flex items-center gap-2 text-sm font-medium text-danger hover:underline"
            >
              <Trash2 size={15} />
              Hapus Promo
            </button>
          ) : (
            <div className="space-y-3">
              <p className="flex items-start gap-2 text-sm text-danger">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                Promo yang dihapus tidak bisa dipakai lagi. Booking yang sudah memakainya tidak terpengaruh.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting && <Loader2 size={14} className="animate-spin" />}
                  Ya, Hapus
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:bg-surface-hover"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </form>
  );
}
