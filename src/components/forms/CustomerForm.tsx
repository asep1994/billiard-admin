'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { FieldError } from '@/components/ui/FieldError';
import type { Customer } from '@/lib/types';

export function CustomerForm({ customer }: { customer?: Customer }) {
  const router = useRouter();
  const isEdit = Boolean(customer);

  const [name, setName] = useState(customer?.name ?? '');
  const [phone, setPhone] = useState(customer?.phone ?? '');
  const [email, setEmail] = useState(customer?.email ?? '');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const payload = { name, phone, email: email || undefined };

      if (isEdit && customer) {
        await apiFetch(`/customers/${customer.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/customers', { method: 'POST', body: JSON.stringify(payload) });
      }

      router.push('/customers');
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.errors ?? {});
        setFormError(err.message);
      } else {
        setFormError('Gagal menyimpan pelanggan.');
      }
    } finally {
      setIsSubmitting(false);
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
          <label className="mb-1 block text-sm text-text-muted">Nama</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <FieldError messages={fieldErrors.name} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-text-muted">No. HP</label>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="081234567890"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <FieldError messages={fieldErrors.phone} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-text-muted">Email (opsional)</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <FieldError messages={fieldErrors.email} />
        </div>
      </Card>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isEdit ? 'Simpan Perubahan' : 'Tambah Pelanggan'}
      </button>
    </form>
  );
}
