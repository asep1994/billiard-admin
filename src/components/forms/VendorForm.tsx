'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { FieldError } from '@/components/ui/FieldError';
import type { Status, Vendor } from '@/lib/types';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function VendorForm({ vendor }: { vendor?: Vendor }) {
  const router = useRouter();
  const isEdit = Boolean(vendor);

  const [name, setName] = useState(vendor?.name ?? '');
  const [slug, setSlug] = useState(vendor?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [email, setEmail] = useState(vendor?.email ?? '');
  const [phone, setPhone] = useState(vendor?.phone ?? '');
  const [address, setAddress] = useState(vendor?.address ?? '');
  const [status, setStatus] = useState<Status>(vendor?.status ?? 'active');
  const [commissionRate, setCommissionRate] = useState(String(vendor?.commission_rate ?? 10));

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const payload = {
        name,
        slug,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        status,
        commission_rate: Number(commissionRate),
      };

      if (isEdit && vendor) {
        await apiFetch(`/vendors/${vendor.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/vendors', { method: 'POST', body: JSON.stringify(payload) });
      }

      router.push('/vendors');
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.errors ?? {});
        setFormError(err.message);
      } else {
        setFormError('Gagal menyimpan vendor.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!vendor) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await apiFetch(`/vendors/${vendor.id}`, { method: 'DELETE' });
      router.push('/vendors');
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Gagal menghapus vendor.');
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
          <label className="mb-1 block text-sm text-text-muted">Nama Vendor</label>
          <input
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder="Unity Billiard Group"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <FieldError messages={fieldErrors.name} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-text-muted">Slug</label>
          <input
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            placeholder="unity-billiard-group"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <FieldError messages={fieldErrors.slug} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-text-muted">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            <FieldError messages={fieldErrors.email} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted">No. Telepon</label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            <FieldError messages={fieldErrors.phone} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-text-muted">Alamat</label>
          <textarea
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            rows={2}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <FieldError messages={fieldErrors.address} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-text-muted">Komisi Platform (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={commissionRate}
              onChange={(event) => setCommissionRate(event.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            <FieldError messages={fieldErrors.commission_rate} />
          </div>

          {isEdit && (
            <div>
              <label className="mb-1 block text-sm text-text-muted">Status</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as Status)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
              <FieldError messages={fieldErrors.status} />
            </div>
          )}
        </div>
      </Card>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isEdit ? 'Simpan Perubahan' : 'Tambah Vendor'}
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
              Hapus Vendor
            </button>
          ) : (
            <div className="space-y-3">
              <p className="flex items-start gap-2 text-sm text-danger">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                Semua venue, meja, member, booking, promo, payout, dan ulasan vendor ini akan ikut terhapus
                permanen. Akun staff/vendor_admin-nya tidak ikut terhapus, tapi jadi tidak terikat vendor mana
                pun. Tindakan ini tidak bisa dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting && <Loader2 size={14} className="animate-spin" />}
                  Ya, Hapus Permanen
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
