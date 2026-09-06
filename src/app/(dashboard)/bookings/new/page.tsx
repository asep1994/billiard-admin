'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { FieldError } from '@/components/ui/FieldError';
import { formatCurrency } from '@/lib/format';
import type { BilliardTable, Booking, Customer, Venue } from '@/lib/types';

function todayDateValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

const TYPE_LABELS: Record<string, string> = {
  '8_ball': '8-Ball',
  '9_ball': '9-Ball',
  snooker: 'Snooker',
  carom: 'Carom',
};

export default function NewBookingPage() {
  const router = useRouter();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [venueId, setVenueId] = useState('');
  const [date, setDate] = useState(todayDateValue());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [tables, setTables] = useState<BilliardTable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [tablesError, setTablesError] = useState<string | null>(null);
  const [tableId, setTableId] = useState<number | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });

  const [notes, setNotes] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiFetch<{ data: Venue[] }>('/venues?per_page=100')
      .then((res) => setVenues(res.data))
      .catch(() => setFormError('Gagal memuat daftar venue.'))
      .finally(() => setVenuesLoading(false));

    apiFetch<{ data: Customer[] }>('/customers?per_page=100')
      .then((res) => setCustomers(res.data))
      .catch(() => {})
      .finally(() => setCustomersLoading(false));
  }, []);

  const startIso = date && startTime ? `${date}T${startTime}:00` : null;
  const endIso = date && endTime ? `${date}T${endTime}:00` : null;
  const isRangeValid = Boolean(startIso && endIso && startIso < endIso);

  useEffect(() => {
    if (!venueId || !isRangeValid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- venue/time cleared, nothing to fetch
      setTables([]);
      return;
    }

    setTablesLoading(true);
    setTablesError(null);

    const query = new URLSearchParams({ start_time: startIso!, end_time: endIso! }).toString();

    apiFetch<{ data: BilliardTable[] }>(`/venues/${venueId}/available-tables?${query}`)
      .then((res) => setTables(res.data))
      .catch((err: unknown) => {
        setTablesError(err instanceof ApiError ? err.message : 'Gagal memuat daftar meja.');
      })
      .finally(() => setTablesLoading(false));
  }, [venueId, startIso, endIso, isRangeValid]);

  // A previously selected table may no longer be in the fresh list once the
  // venue/time range changes; treat it as deselected instead of resetting
  // state from an effect.
  const effectiveTableId = tables.some((table) => table.id === tableId) ? tableId : null;

  const filteredCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) return customers;

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) || customer.phone.toLowerCase().includes(query),
    );
  }, [customers, customerSearch]);

  const selectedTable = tables.find((table) => table.id === effectiveTableId) ?? null;
  const durationHours =
    startIso && endIso ? (new Date(endIso).getTime() - new Date(startIso).getTime()) / 3600000 : 0;
  const estimatedPrice = selectedTable ? parseFloat(selectedTable.hourly_rate) * durationHours : null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!venueId || !isRangeValid || !effectiveTableId) {
      setFormError('Lengkapi venue, waktu, dan meja terlebih dahulu.');
      return;
    }

    if (customerMode === 'existing' && !customerId) {
      setFormError('Pilih pelanggan terlebih dahulu.');
      return;
    }

    if (customerMode === 'new' && (!newCustomer.name.trim() || !newCustomer.phone.trim())) {
      setFormError('Nama dan nomor HP pelanggan baru wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalCustomerId = customerId;

      if (customerMode === 'new') {
        const response = await apiFetch<{ data: Customer }>('/customers', {
          method: 'POST',
          body: JSON.stringify({
            name: newCustomer.name.trim(),
            phone: newCustomer.phone.trim(),
            email: newCustomer.email.trim() || undefined,
          }),
        });
        finalCustomerId = response.data.id;
      }

      await apiFetch<{ data: Booking }>('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          venue_id: Number(venueId),
          billiard_table_id: effectiveTableId,
          customer_id: finalCustomerId,
          start_time: startIso,
          end_time: endIso,
          promo_code: promoCode.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      router.push('/bookings?created=1');
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.errors ?? {});
        setFormError(err.message);
      } else {
        setFormError('Gagal membuat booking.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/bookings" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Kembali ke Booking
      </Link>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            {formError}
          </div>
        )}

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-text">Venue &amp; Waktu</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
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

            <div>
              <label className="mb-1 block text-sm text-text-muted">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-text-muted">Jam Mulai</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted">Jam Selesai</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {startTime && endTime && !isRangeValid && (
            <p className="mt-3 text-xs text-danger">Jam selesai harus setelah jam mulai.</p>
          )}
          <FieldError messages={fieldErrors.start_time ?? fieldErrors.end_time} />
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-text">Pilih Meja</h2>

          {!venueId || !isRangeValid ? (
            <p className="text-sm text-text-muted">Pilih venue dan waktu terlebih dahulu.</p>
          ) : tablesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-primary" size={22} />
            </div>
          ) : tablesError ? (
            <p className="text-sm text-danger">{tablesError}</p>
          ) : tables.length === 0 ? (
            <p className="text-sm text-text-muted">Tidak ada meja kosong pada rentang waktu ini.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {tables.map((table) => (
                <button
                  type="button"
                  key={table.id}
                  onClick={() => setTableId(table.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    effectiveTableId === table.id
                      ? 'border-primary bg-primary-soft'
                      : 'border-border bg-bg hover:bg-surface-hover'
                  }`}
                >
                  <p className="text-sm font-medium text-text">{table.name}</p>
                  <p className="text-xs text-text-faint">{TYPE_LABELS[table.type] ?? table.type}</p>
                  <p className="mt-1 text-xs font-medium text-text-muted">
                    {formatCurrency(table.hourly_rate)}/jam
                  </p>
                </button>
              ))}
            </div>
          )}
          <FieldError messages={fieldErrors.billiard_table_id} />
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">Pelanggan</h2>
            <div className="flex overflow-hidden rounded-lg border border-border text-xs">
              <button
                type="button"
                onClick={() => setCustomerMode('existing')}
                className={`px-3 py-1.5 ${customerMode === 'existing' ? 'bg-primary-soft text-primary' : 'text-text-muted'}`}
              >
                Terdaftar
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('new')}
                className={`px-3 py-1.5 ${customerMode === 'new' ? 'bg-primary-soft text-primary' : 'text-text-muted'}`}
              >
                Baru
              </button>
            </div>
          </div>

          {customerMode === 'existing' ? (
            <div>
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
                <input
                  value={customerSearch}
                  onChange={(event) => setCustomerSearch(event.target.value)}
                  placeholder="Cari nama atau nomor HP..."
                  className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm text-text outline-none focus:border-primary"
                />
              </div>

              {customersLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin text-primary" size={20} />
                </div>
              ) : (
                <div className="max-h-56 space-y-1 overflow-y-auto">
                  {filteredCustomers.length === 0 ? (
                    <p className="py-4 text-center text-sm text-text-muted">Tidak ada pelanggan cocok.</p>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <button
                        type="button"
                        key={customer.id}
                        onClick={() => setCustomerId(customer.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                          customerId === customer.id
                            ? 'bg-primary-soft text-primary'
                            : 'text-text-muted hover:bg-surface-hover hover:text-text'
                        }`}
                      >
                        <span>{customer.name}</span>
                        <span className="text-xs text-text-faint">{customer.phone}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
              <FieldError messages={fieldErrors.customer_id} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-text-muted">Nama</label>
                <input
                  value={newCustomer.name}
                  onChange={(event) => setNewCustomer((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted">No. HP</label>
                <input
                  value={newCustomer.phone}
                  onChange={(event) => setNewCustomer((prev) => ({ ...prev, phone: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
                />
                <FieldError messages={fieldErrors.phone} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-text-muted">Email (opsional)</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(event) => setNewCustomer((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
                />
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <label className="mb-1 block text-sm text-text-muted">Kode Promo (opsional)</label>
          <input
            value={promoCode}
            onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
            placeholder="DISKON20"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm uppercase text-text outline-none focus:border-primary"
          />
          <FieldError messages={fieldErrors.promo_code} />
        </Card>

        <Card className="p-5">
          <label className="mb-1 block text-sm text-text-muted">Catatan (opsional)</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
        </Card>

        <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-text-muted">Estimasi Total</p>
            <p className="text-lg font-semibold text-text">
              {estimatedPrice !== null ? formatCurrency(estimatedPrice) : '-'}
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Simpan Booking
          </button>
        </Card>
      </form>
    </div>
  );
}
