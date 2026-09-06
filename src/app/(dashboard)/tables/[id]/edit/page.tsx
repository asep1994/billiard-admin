'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { TableForm } from '@/components/forms/TableForm';
import type { BilliardTable } from '@/lib/types';

export default function EditTablePage() {
  const params = useParams<{ id: string }>();
  const [table, setTable] = useState<BilliardTable | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: BilliardTable }>(`/tables/${params.id}`)
      .then((res) => setTable(res.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Gagal memuat data meja.'));
  }, [params.id]);

  return (
    <div className="space-y-4">
      <Link href="/tables" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Kembali ke Meja Billiard
      </Link>

      {error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : !table ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (
        <TableForm table={table} />
      )}
    </div>
  );
}
