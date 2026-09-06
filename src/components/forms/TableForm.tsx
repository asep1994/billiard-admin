'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { FieldError } from '@/components/ui/FieldError';
import type { BilliardTable, TableStatus, TableType, Venue } from '@/lib/types';

const TYPE_OPTIONS: { value: TableType; label: string }[] = [
  { value: '8_ball', label: '8-Ball' },
  { value: '9_ball', label: '9-Ball' },
  { value: 'snooker', label: 'Snooker' },
  { value: 'carom', label: 'Carom' },
];

const STATUS_OPTIONS: { value: TableStatus; label: string }[] = [
  { value: 'available', label: 'Tersedia' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inactive', label: 'Nonaktif' },
];

export function TableForm({ table }: { table?: BilliardTable }) {
  const router = useRouter();
  const isEdit = Boolean(table);

  const [venues, setVenues] = useState<Venue[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(!isEdit);
  const [venueId, setVenueId] = useState(table ? String(table.venue_id) : '');
  const [name, setName] = useState(table?.name ?? '');
  const [type, setType] = useState<TableType>(table?.type ?? '8_ball');
  const [hourlyRate, setHourlyRate] = useState(table?.hourly_rate ?? '');
  const [status, setStatus] = useState<TableStatus>(table?.status ?? 'available');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) return;

    apiFetch<{ data: Venue[] }>('/venues?per_page=100')
      .then((res) => setVenues(res.data))
      .catch(() => setFormError('Gagal memuat daftar venue.'))
      .finally(() => setVenuesLoading(false));
  }, [isEdit]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      if (isEdit && table) {
        await apiFetch(`/tables/${table.id}`, {
          method: 'PUT',
          body: JSON.stringify({ name, type, hourly_rate: hourlyRate, status }),
        });
      } else {
        await apiFetch('/tables', {
          method: 'POST',
          body: JSON.stringify({ venue_id: Number(venueId), name, type, hourly_rate: hourlyRate, status }),
        });
      }

      router.push('/tables');
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.errors ?? {});
        setFormError(err.message);
      } else {
        setFormError('Gagal menyimpan meja.');
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
        {isEdit ? (
          <div>
            <label className="mb-1 block text-sm text-text-muted">Venue</label>
            <p className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-muted">
              {table?.venue?.name ?? `Venue #${table?.venue_id}`}
            </p>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm text-text-muted">Venue</label>
            <select
              value={venueId}
              onChange={(event) => setVenueId(event.target.value)}
              disabled={venuesLoading}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              <option value="">{venuesLoading ? 'Memuat venue...' : 'Pilih venue'}</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
            <FieldError messages={fieldErrors.venue_id} />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm text-text-muted">Nama Meja</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Table 1"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <FieldError messages={fieldErrors.name} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-text-muted">Tipe</label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as TableType)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError messages={fieldErrors.type} />
          </div>

          <div>
            <label className="mb-1 block text-sm text-text-muted">Tarif/Jam (Rp)</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={hourlyRate}
              onChange={(event) => setHourlyRate(event.target.value)}
              placeholder="50000"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            <FieldError messages={fieldErrors.hourly_rate} />
          </div>
        </div>

        {isEdit && (
          <div>
            <label className="mb-1 block text-sm text-text-muted">Status</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as TableStatus)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError messages={fieldErrors.status} />
          </div>
        )}
      </Card>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isEdit ? 'Simpan Perubahan' : 'Tambah Meja'}
      </button>
    </form>
  );
}
