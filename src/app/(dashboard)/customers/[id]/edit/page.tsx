'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { CustomerForm } from '@/components/forms/CustomerForm';
import type { Customer } from '@/lib/types';

export default function EditCustomerPage() {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Customer }>(`/customers/${params.id}`)
      .then((res) => setCustomer(res.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Gagal memuat data pelanggan.'));
  }, [params.id]);

  return (
    <div className="space-y-4">
      <Link href="/customers" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Kembali ke Member
      </Link>

      {error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : !customer ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (
        <CustomerForm customer={customer} />
      )}
    </div>
  );
}
