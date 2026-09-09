'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { useApiList } from '@/lib/useApiList';
import { Card } from '@/components/ui/Card';
import type { Banner } from '@/lib/types';

export default function BannersPage() {
  const { data, isLoading, error, refetch } = useApiList<Banner>('/banners?per_page=100');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const sorted = [...data].sort((a, b) => a.order - b.order);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const body = new FormData();
      body.append('image', file);
      if (title.trim()) body.append('title', title.trim());
      await apiFetch('/banners', { method: 'POST', body });
      setTitle('');
      refetch();
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : 'Gagal mengunggah banner.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function toggleActive(banner: Banner) {
    setBusyId(banner.id);
    try {
      await apiFetch(`/banners/${banner.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !banner.is_active }),
      });
      refetch();
    } finally {
      setBusyId(null);
    }
  }

  async function move(banner: Banner, direction: 'up' | 'down') {
    const index = sorted.findIndex((item) => item.id === banner.id);
    const swapWith = direction === 'up' ? sorted[index - 1] : sorted[index + 1];
    if (!swapWith) return;

    setBusyId(banner.id);
    try {
      await Promise.all([
        apiFetch(`/banners/${banner.id}`, { method: 'PUT', body: JSON.stringify({ order: swapWith.order }) }),
        apiFetch(`/banners/${swapWith.id}`, { method: 'PUT', body: JSON.stringify({ order: banner.order }) }),
      ]);
      refetch();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(banner: Banner) {
    setBusyId(banner.id);
    try {
      await apiFetch(`/banners/${banner.id}`, { method: 'DELETE' });
      refetch();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-text">Banner Homepage</h2>
        <p className="text-sm text-text-muted">Banner ini tampil bergantian di halaman utama aplikasi customer.</p>
      </div>

      <Card className="space-y-3 p-5">
        <div>
          <label className="mb-1 block text-sm text-text-muted">Judul (opsional, catatan internal saja)</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Misal: Promo Kemerdekaan"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
        </div>
        {uploadError && <p className="text-sm text-danger">{uploadError}</p>}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          Upload Banner
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-danger">{error}</p>
        ) : sorted.length === 0 ? (
          <p className="p-6 text-sm text-text-muted">Belum ada banner. Upload satu di atas.</p>
        ) : (
          <div className="divide-y divide-border">
            {sorted.map((banner, index) => (
              <div key={banner.id} className="flex items-center gap-4 px-5 py-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.image_url ?? ''}
                  alt={banner.title ?? 'Banner'}
                  className="h-16 w-28 shrink-0 rounded-lg border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text">{banner.title ?? '(Tanpa judul)'}</p>
                  <p className="text-xs text-text-faint">Urutan {banner.order}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => move(banner, 'up')}
                    disabled={busyId === banner.id || index === 0}
                    className="rounded-lg border border-border p-2 text-text-muted hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Naikkan urutan"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => move(banner, 'down')}
                    disabled={busyId === banner.id || index === sorted.length - 1}
                    className="rounded-lg border border-border p-2 text-text-muted hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Turunkan urutan"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => toggleActive(banner)}
                    disabled={busyId === banner.id}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60 ${
                      banner.is_active
                        ? 'border-primary/30 text-primary hover:bg-primary-soft'
                        : 'border-border text-text-faint hover:bg-surface-hover'
                    }`}
                  >
                    {banner.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                  <button
                    onClick={() => handleDelete(banner)}
                    disabled={busyId === banner.id}
                    className="rounded-lg border border-danger/30 p-2 text-danger hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Hapus banner"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
