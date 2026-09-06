'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { VendorForm } from '@/components/forms/VendorForm';
import type { Vendor } from '@/lib/types';

export default function EditVendorPage() {
  const params = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Vendor }>(`/vendors/${params.id}`)
      .then((res) => setVendor(res.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Gagal memuat data vendor.'));
  }, [params.id]);

  return (
    <div className="space-y-4">
      <Link href="/vendors" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Kembali ke Vendor
      </Link>

      {error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : !vendor ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (
        <VendorForm vendor={vendor} />
      )}
    </div>
  );
}
