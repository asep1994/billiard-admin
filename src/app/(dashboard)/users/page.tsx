'use client';

import { Loader2, ShieldAlert } from 'lucide-react';
import { useApiList } from '@/lib/useApiList';
import { Card } from '@/components/ui/Card';
import type { AuthUser } from '@/lib/types';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  vendor_admin: 'Vendor Admin',
  staff: 'Staff',
};

export default function UsersPage() {
  const { data, meta, isLoading, error } = useApiList<AuthUser>('/users?per_page=100');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-text">User &amp; Role</h2>
        <p className="text-sm text-text-muted">{meta?.total ?? 0} pengguna terdaftar</p>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-hover">
                    <td className="px-4 py-3 font-medium text-text">{user.name}</td>
                    <td className="px-4 py-3 text-text-muted">{user.email}</td>
                    <td className="px-4 py-3 text-text-muted">{ROLE_LABELS[user.role] ?? user.role}</td>
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
