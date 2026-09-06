'use client';

import Link from 'next/link';
import { Loader2, Plus, ShieldAlert } from 'lucide-react';
import { useApiList } from '@/lib/useApiList';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import type { AuthUser } from '@/lib/types';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  vendor_admin: 'Vendor Admin',
  staff: 'Staff',
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { data, meta, isLoading, error } = useApiList<AuthUser>('/users?per_page=100');
  const canManage = currentUser?.role === 'super_admin' || currentUser?.role === 'vendor_admin';
  const isSuperAdmin = currentUser?.role === 'super_admin';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text">User &amp; Role</h2>
          <p className="text-sm text-text-muted">{meta?.total ?? 0} pengguna terdaftar</p>
        </div>
        {canManage && (
          <Link
            href="/users/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary-dark"
          >
            <Plus size={16} />
            Tambah Pengguna
          </Link>
        )}
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <ShieldAlert className="text-danger" size={24} />
            <p className="text-sm text-danger">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <p className="p-6 text-sm text-text-muted">Belum ada pengguna lain.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-surface-hover text-xs uppercase tracking-wide text-text-faint">
                <tr>
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  {isSuperAdmin && <th className="px-4 py-3 font-medium">Vendor</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-hover">
                    <td className="px-4 py-3 font-medium text-text">
                      {canManage ? (
                        <Link href={`/users/${user.id}/edit`} className="hover:underline">
                          {user.name}
                        </Link>
                      ) : (
                        user.name
                      )}
                      {user.id === currentUser?.id && <span className="ml-2 text-xs text-text-faint">(Anda)</span>}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{user.email}</td>
                    <td className="px-4 py-3 text-text-muted">{ROLE_LABELS[user.role] ?? user.role}</td>
                    {isSuperAdmin && (
                      <td className="px-4 py-3 text-text-muted">{user.vendor?.name ?? '-'}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
