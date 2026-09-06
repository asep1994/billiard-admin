'use client';

import Link from 'next/link';
import { Loader2, Plus } from 'lucide-react';
import { useApiList } from '@/lib/useApiList';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Vendor } from '@/lib/types';

export default function VendorsPage() {
  const { data, meta, isLoading, error } = useApiList<Vendor>('/vendors?per_page=100');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text">Vendor</h2>
          <p className="text-sm text-text-muted">{meta?.total ?? 0} vendor terdaftar</p>
        </div>
        <Link
          href="/vendors/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary-dark"
        >
          <Plus size={16} />
          Tambah Vendor
        </Link>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-danger">{error}</p>
        ) : data.length === 0 ? (
          <p className="p-6 text-sm text-text-muted">Belum ada vendor terdaftar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-surface-hover text-xs uppercase tracking-wide text-text-faint">
                <tr>
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Kontak</th>
                  <th className="px-4 py-3 font-medium">Komisi</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((vendor) => (
                  <tr key={vendor.id} className="cursor-pointer hover:bg-surface-hover">
                    <td className="px-4 py-3">
                      <Link href={`/vendors/${vendor.id}/edit`} className="font-medium text-text hover:underline">
                        {vendor.name}
                      </Link>
                      <span className="block text-xs text-text-faint">{vendor.slug}</span>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {vendor.email ?? '-'}
                      {vendor.phone && <span className="block text-xs text-text-faint">{vendor.phone}</span>}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{vendor.commission_rate}%</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={vendor.status} />
                    </td>
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
