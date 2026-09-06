'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { PromotionForm } from '@/components/forms/PromotionForm';
import type { Promotion } from '@/lib/types';

export default function EditPromotionPage() {
  const params = useParams<{ id: string }>();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Promotion }>(`/promotions/${params.id}`)
      .then((res) => setPromotion(res.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Gagal memuat data promo.'));
  }, [params.id]);

  return (
    <div className="space-y-4">
      <Link href="/promotions" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Kembali ke Promo
      </Link>

      {error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : !promotion ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (
        <PromotionForm promotion={promotion} />
      )}
    </div>
  );
}
