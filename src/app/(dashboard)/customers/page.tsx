'use client';

import { useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { useApiList } from '@/lib/useApiList';
import { Card } from '@/components/ui/Card';
import type { Customer } from '@/lib/types';

export default function CustomersPage() {
  const { data, meta, isLoading, error } = useApiList<Customer>('/customers?per_page=100');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data;

    return data.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) || customer.phone.toLowerCase().includes(query),
    );
  }, [data, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-text">Member</h2>
          <p className="text-sm text-text-muted">{meta?.total ?? 0} pelanggan terdaftar</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama atau nomor HP..."
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text outline-none focus:border-primary"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-danger">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-text-muted">Tidak ada pelanggan ditemukan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-surface-hover text-xs uppercase tracking-wide text-text-faint">
                <tr>
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">No. HP</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-surface-hover">
                    <td className="px-4 py-3 font-medium text-text">{customer.name}</td>
                    <td className="px-4 py-3 text-text-muted">{customer.phone}</td>
                    <td className="px-4 py-3 text-text-muted">{customer.email ?? '-'}</td>
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
