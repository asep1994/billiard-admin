'use client';

import Link from 'next/link';
import { Loader2, Plus, Tag } from 'lucide-react';
import { useApiList } from '@/lib/useApiList';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Promotion } from '@/lib/types';

function formatValue(promotion: Promotion): string {
  return promotion.type === 'percentage' ? `${promotion.value}%` : formatCurrency(promotion.value);
}

export default function PromotionsPage() {
  const { data, meta, isLoading, error } = useApiList<Promotion>('/promotions?per_page=100');
  const { user } = useAuth();
  const canManage = user?.role === 'super_admin' || user?.role === 'vendor_admin';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text">Promo</h2>
          <p className="text-sm text-text-muted">{meta?.total ?? 0} kode promo</p>
        </div>
        {canManage && (
          <Link
            href="/promotions/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary-dark"
          >
            <Plus size={16} />
            Tambah Promo
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : data.length === 0 ? (
        <Card className="p-6 text-sm text-text-muted">Belum ada kode promo.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((promotion) => {
            const content = (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-primary" />
                    <p className="font-mono font-semibold text-text">{promotion.code}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      promotion.is_valid_now
                        ? 'bg-primary-soft text-primary'
                        : 'bg-surface-hover text-text-faint'
                    }`}
                  >
                    {promotion.is_valid_now ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </div>

                <p className="mt-3 text-lg font-semibold text-text">{formatValue(promotion)}</p>
                {promotion.max_discount && (
                  <p className="text-xs text-text-faint">Maks. {formatCurrency(promotion.max_discount)}</p>
                )}

                <div className="mt-3 space-y-1 text-xs text-text-muted">
                  {promotion.expires_at && <p>Berakhir {formatDate(promotion.expires_at)}</p>}
                  <p>
                    Dipakai {promotion.times_used}
                    {promotion.usage_limit ? ` / ${promotion.usage_limit}` : ''} kali
                  </p>
                </div>
              </>
            );

            return canManage ? (
              <Link key={promotion.id} href={`/promotions/${promotion.id}/edit`}>
                <Card className="p-5 transition hover:border-primary/50">{content}</Card>
              </Link>
            ) : (
              <Card key={promotion.id} className="p-5">
                {content}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
