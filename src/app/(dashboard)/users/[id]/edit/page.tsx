'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { UserForm } from '@/components/forms/UserForm';
import type { AuthUser } from '@/lib/types';

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const [targetUser, setTargetUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: AuthUser }>(`/users/${params.id}`)
      .then((res) => setTargetUser(res.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Gagal memuat data pengguna.'));
  }, [params.id]);

  return (
    <div className="space-y-4">
      <Link href="/users" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Kembali ke User &amp; Role
      </Link>

      {error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : !targetUser ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (
        <UserForm targetUser={targetUser} />
      )}
    </div>
  );
}
