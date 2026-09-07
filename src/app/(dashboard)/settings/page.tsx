'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ImageOff, Loader2, LocateFixed, Plus, Upload } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApiList } from '@/lib/useApiList';
import { Card } from '@/components/ui/Card';
import { FieldError } from '@/components/ui/FieldError';
import type { Venue, Vendor } from '@/lib/types';

function VendorProfileForm({ vendorId, canEdit }: { vendorId: number; canEdit: boolean }) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiFetch<{ data: Vendor }>(`/vendors/${vendorId}`).then((res) => {
      setVendor(res.data);
      setName(res.data.name);
      setEmail(res.data.email ?? '');
      setPhone(res.data.phone ?? '');
      setAddress(res.data.address ?? '');
    });
  }, [vendorId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSaved(false);
    setIsSubmitting(true);

    try {
      await apiFetch(`/vendors/${vendorId}`, {
        method: 'PUT',
        body: JSON.stringify({ name, email: email || undefined, phone: phone || undefined, address: address || undefined }),
      });
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.errors ?? {});
        setFormError(err.message);
      } else {
        setFormError('Gagal menyimpan profil vendor.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!vendor) {
    return (
      <Card className="flex justify-center p-8">
        <Loader2 className="animate-spin text-primary" size={20} />
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="space-y-4 p-5">
        <h3 className="text-sm font-semibold text-text">Profil Vendor</h3>

        {formError && <p className="text-sm text-danger">{formError}</p>}
        {saved && (
          <p className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle2 size={15} />
            Perubahan tersimpan.
          </p>
        )}

        <div>
          <label className="mb-1 block text-sm text-text-muted">Nama Vendor</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={!canEdit}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.name} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-text-muted">Email</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={!canEdit}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-60"
            />
            <FieldError messages={fieldErrors.email} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted">No. Telepon</label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              disabled={!canEdit}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-60"
            />
            <FieldError messages={fieldErrors.phone} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-text-muted">Alamat</label>
          <textarea
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            disabled={!canEdit}
            rows={2}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.address} />
        </div>

        {canEdit && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            Simpan
          </button>
        )}
      </Card>
    </form>
  );
}

function VenueSettingsCard({ venue, canEdit }: { venue: Venue; canEdit: boolean }) {
  const [photoUrl, setPhotoUrl] = useState(venue.photo_url);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(venue.name);
  const [address, setAddress] = useState(venue.address ?? '');
  const [phone, setPhone] = useState(venue.phone ?? '');
  const [openingTime, setOpeningTime] = useState(venue.opening_time ?? '');
  const [closingTime, setClosingTime] = useState(venue.closing_time ?? '');
  const [latitude, setLatitude] = useState(venue.latitude != null ? String(venue.latitude) : '');
  const [longitude, setLongitude] = useState(venue.longitude != null ? String(venue.longitude) : '');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
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

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    setIsUploadingPhoto(true);

    try {
      const body = new FormData();
      body.append('photo', file);
      const res = await apiFetch<{ data: Venue }>(`/venues/${venue.id}/photo`, { method: 'POST', body });
      setPhotoUrl(res.data.photo_url);
    } catch (err) {
      setPhotoError(err instanceof ApiError ? err.message : 'Gagal mengunggah foto.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSaved(false);
    setIsSubmitting(true);

    try {
      await apiFetch(`/venues/${venue.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name,
          address: address || undefined,
          phone: phone || undefined,
          opening_time: openingTime || undefined,
          closing_time: closingTime || undefined,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
        }),
      });
      setSaved(true);
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
    <form onSubmit={handleSubmit}>
      <Card className="space-y-4 p-5">
        {formError && <p className="text-sm text-danger">{formError}</p>}
        {saved && (
          <p className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle2 size={15} />
            Perubahan tersimpan.
          </p>
        )}

        <div>
          <label className="mb-1 block text-sm text-text-muted">Foto Venue</label>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-bg">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt={venue.name} className="h-full w-full object-cover" />
              ) : (
                <ImageOff size={20} className="text-text-faint" />
              )}
            </div>
            {canEdit && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={isUploadingPhoto}
                  className="hidden"
                  id={`venue-photo-${venue.id}`}
                />
                <label
                  htmlFor={`venue-photo-${venue.id}`}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text hover:border-primary"
                >
                  {isUploadingPhoto ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                  {photoUrl ? 'Ganti Foto' : 'Unggah Foto'}
                </label>
                {photoError && <p className="mt-1 text-xs text-danger">{photoError}</p>}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-text-muted">Nama Venue</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={!canEdit}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.name} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-text-muted">Jam Buka</label>
            <input
              type="time"
              value={openingTime}
              onChange={(event) => setOpeningTime(event.target.value)}
              disabled={!canEdit}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-60"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted">Jam Tutup</label>
            <input
              type="time"
              value={closingTime}
              onChange={(event) => setClosingTime(event.target.value)}
              disabled={!canEdit}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-60"
            />
            <FieldError messages={fieldErrors.closing_time} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-text-muted">No. Telepon</label>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            disabled={!canEdit}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-60"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-text-muted">Alamat</label>
          <textarea
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            disabled={!canEdit}
            rows={2}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-60"
          />
        </div>

        {canEdit && (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm text-text-muted">Lokasi (buat fitur venue terdekat)</label>
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
                placeholder="Latitude"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
              />
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                placeholder="Longitude"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
              />
            </div>
            {locationError && <p className="mt-1 text-xs text-danger">{locationError}</p>}
            <FieldError messages={fieldErrors.latitude ?? fieldErrors.longitude} />
          </div>
        )}

        {canEdit && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            Simpan
          </button>
        )}
      </Card>
    </form>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const venues = useApiList<Venue>('/venues?per_page=100');
  const canEdit = user?.role === 'super_admin' || user?.role === 'vendor_admin';

  if (!user?.vendor_id) {
    return (
      <Card className="p-6 text-sm text-text-muted">
        Halaman pengaturan ini khusus untuk pengelola satu vendor. Super admin tidak terikat ke vendor
        tertentu.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-text">Pengaturan</h2>
        <p className="text-sm text-text-muted">
          {canEdit ? 'Kelola profil vendor dan jam operasional venue' : 'Lihat profil vendor dan venue (read-only)'}
        </p>
      </div>

      <VendorProfileForm vendorId={user.vendor_id} canEdit={canEdit} />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text">Venue</h3>
          {canEdit && (
            <Link
              href="/venues/new"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-black hover:bg-primary-dark"
            >
              <Plus size={14} />
              Tambah Venue
            </Link>
          )}
        </div>
        {venues.isLoading ? (
          <Card className="flex justify-center p-8">
            <Loader2 className="animate-spin text-primary" size={20} />
          </Card>
        ) : (
          <div className="space-y-4">
            {venues.data.map((venue) => (
              <VenueSettingsCard key={venue.id} venue={venue} canEdit={canEdit} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
