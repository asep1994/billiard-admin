'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Loader2, Plus, Star, Trash2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useApiList } from '@/lib/useApiList';
import { Card } from '@/components/ui/Card';
import { FieldError } from '@/components/ui/FieldError';
import { formatDate } from '@/lib/format';
import type { Booking, Review } from '@/lib/types';

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} size={14} className={index < value ? 'fill-warning text-warning' : 'text-text-faint'} />
      ))}
    </div>
  );
}

function NewReviewForm({
  bookings,
  onCreated,
  onCancel,
}: {
  bookings: Booking[];
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [bookingId, setBookingId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({ booking_id: Number(bookingId), rating, comment: comment || undefined }),
      });
      onCreated();
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.errors ?? {});
        setFormError(err.message);
      } else {
        setFormError('Gagal menyimpan ulasan.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <p className="text-sm text-danger">{formError}</p>}

        <div>
          <label className="mb-1 block text-sm text-text-muted">Booking</label>
          <select
            value={bookingId}
            onChange={(event) => setBookingId(event.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          >
            <option value="">Pilih booking selesai</option>
            {bookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                BK-{String(booking.id).padStart(4, '0')} &middot; {booking.customer?.name ?? 'Pelanggan'} &middot;{' '}
                {booking.billiard_table?.name}
              </option>
            ))}
          </select>
          <FieldError messages={fieldErrors.booking_id} />
          {bookings.length === 0 && (
            <p className="mt-1 text-xs text-text-faint">Tidak ada booking selesai yang belum diberi ulasan.</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm text-text-muted">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)} className="p-0.5" aria-label={`${star} bintang`}>
                <Star size={22} className={star <= rating ? 'fill-warning text-warning' : 'text-text-faint'} />
              </button>
            ))}
          </div>
          <FieldError messages={fieldErrors.rating} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-text-muted">Komentar (opsional)</label>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={3}
            placeholder="Apa kata pelanggan?"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <FieldError messages={fieldErrors.comment} />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !bookingId}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            Simpan Ulasan
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:bg-surface-hover"
          >
            Batal
          </button>
        </div>
      </form>
    </Card>
  );
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'super_admin' || user?.role === 'vendor_admin' || user?.role === 'staff';
  const canDelete = user?.role === 'super_admin' || user?.role === 'vendor_admin';

  const reviews = useApiList<Review>('/reviews?per_page=100');
  const bookingsList = useApiList<Booking>('/bookings?per_page=100');
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const reviewedBookingIds = useMemo(() => new Set(reviews.data.map((review) => review.booking_id)), [reviews.data]);
  const reviewableBookings = useMemo(
    () => bookingsList.data.filter((booking) => booking.status === 'completed' && !reviewedBookingIds.has(booking.id)),
    [bookingsList.data, reviewedBookingIds],
  );

  const averageRating = useMemo(() => {
    if (reviews.data.length === 0) return 0;
    return reviews.data.reduce((sum, review) => sum + review.rating, 0) / reviews.data.length;
  }, [reviews.data]);

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await apiFetch(`/reviews/${id}`, { method: 'DELETE' });
      reviews.refetch();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text">Ulasan</h2>
          <p className="text-sm text-text-muted">
            {reviews.meta?.total ?? 0} ulasan &middot; rata-rata {averageRating.toFixed(1)} / 5
          </p>
        </div>
        {canManage && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary-dark"
          >
            <Plus size={16} />
            Tambah Ulasan
          </button>
        )}
      </div>

      {showForm && (
        <NewReviewForm
          bookings={reviewableBookings}
          onCreated={() => {
            setShowForm(false);
            reviews.refetch();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <Card className="overflow-hidden">
        {reviews.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : reviews.error ? (
          <p className="p-6 text-sm text-danger">{reviews.error}</p>
        ) : reviews.data.length === 0 ? (
          <p className="p-6 text-sm text-text-muted">Belum ada ulasan.</p>
        ) : (
          <div className="divide-y divide-border">
            {reviews.data.map((review) => (
              <div key={review.id} className="flex items-start justify-between gap-3 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <StarRating value={review.rating} />
                    <span className="text-xs text-text-faint">{review.venue?.name}</span>
                  </div>
                  {review.comment && <p className="mt-1 text-sm text-text">{review.comment}</p>}
                  <p className="mt-1 text-xs text-text-faint">
                    {review.customer?.name ?? 'Pelanggan'} &middot; {formatDate(review.created_at)}
                  </p>
                </div>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    className="shrink-0 rounded-lg border border-danger/30 p-2 text-danger hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Hapus ulasan"
                  >
                    {deletingId === review.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
