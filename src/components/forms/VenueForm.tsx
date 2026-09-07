'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LocateFixed } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useActiveVenue } from '@/lib/activeVenue';
import { Card } from '@/components/ui/Card';
import { FieldError } from '@/components/ui/FieldError';
import type { Vendor } from '@/lib/types';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function VenueForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { refetch: refetchActiveVenues } = useActiveVenue();
  const isSuperAdmin = user?.role === 'super_admin';

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorId, setVendorId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError('Browser ini tidak mendukung deteksi lokasi.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(7));
        setLongitude(position.coords.longitude.toFixed(7));
        setIsLocating(false);
      },
      () => {
        setLocationError('Gagal mengambil lokasi. Pastikan izin lokasi diizinkan.');
        setIsLocating(false);
      },
    );
  }

  useEffect(() => {
    if (!isSuperAdmin) return;

    apiFetch<{ data: Vendor[] }>('/vendors?per_page=100').then((res) => setVendors(res.data));
  }, [isSuperAdmin]);

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
      await apiFetch('/venues', {
        method: 'POST',
        body: JSON.stringify({
          vendor_id: isSuperAdmin ? Number(vendorId) : undefined,
          name,
          slug,
          address: address || undefined,
          city: city || undefined,
          latitude: latitude ? Number(latitude) : undefined,
          longitude: longitude ? Number(longitude) : undefined,
          phone: phone || undefined,
          opening_time: openingTime || undefined,
          closing_time: closingTime || undefined,
        }),
      });

      refetchActiveVenues();
      router.push(user?.vendor_id ? '/settings' : '/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.errors ?? {});
        setFormError(err.message);
      } else {
        setFormError('Gagal menyimpan venue.');
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
        {isSuperAdmin && (
          <div>
            <label className="mb-1 block text-sm text-text-muted">Vendor</label>
            <select
              value={vendorId}
              onChange={(event) => setVendorId(event.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              <option value="">Pilih vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
            <FieldError messages={fieldErrors.vendor_id} />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm text-text-muted">Nama Venue</label>
          <input
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder="Unity Billiard Bandung"
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
            placeholder="unity-billiard-bandung"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <FieldError messages={fieldErrors.slug} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-text-muted">Jam Buka</label>
            <input
              type="time"
              value={openingTime}
              onChange={(event) => setOpeningTime(event.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            <FieldError messages={fieldErrors.opening_time} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted">Jam Tutup</label>
            <input
              type="time"
              value={closingTime}
              onChange={(event) => setClosingTime(event.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            <FieldError messages={fieldErrors.closing_time} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-text-muted">Kota</label>
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Bandung"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <FieldError messages={fieldErrors.city} />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm text-text-muted">Lokasi (opsional)</label>
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-60"
            >
              {isLocating ? <Loader2 size={12} className="animate-spin" /> : <LocateFixed size={12} />}
              Gunakan lokasi saat ini
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
              placeholder="Latitude, mis. -6.9175"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
              placeholder="Longitude, mis. 107.6191"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          </div>
          {locationError && <p className="mt-1 text-xs text-danger">{locationError}</p>}
          <FieldError messages={fieldErrors.latitude ?? fieldErrors.longitude} />
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
      </Card>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        Tambah Venue
      </button>
    </form>
  );
}
