'use client';

import { useState } from 'react';
import { Loader2, MapPin, Star, ExternalLink } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useApiList } from '@/lib/useApiList';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/format';
import type { PartnerLead, LeadStatus } from '@/lib/types';

const STATUS_FILTERS: { value: LeadStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'new', label: 'Baru' },
  { value: 'contacted', label: 'Dihubungi' },
  { value: 'converted', label: 'Gabung' },
  { value: 'rejected', label: 'Ditolak' },
];

export default function PartnerLeadsPage() {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const path =
    statusFilter === 'all'
      ? '/partner-leads?per_page=100'
      : `/partner-leads?per_page=100&status=${statusFilter}`;
  const { data, meta, isLoading, error, refetch } = useApiList<PartnerLead>(path);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function updateStatus(lead: PartnerLead, status: LeadStatus) {
    setBusyId(lead.id);
    try {
      await apiFetch(`/partner-leads/${lead.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      refetch();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-text">Calon Mitra</h2>
        <p className="text-sm text-text-muted">
          {meta?.total ?? 0} tempat billiard ditemukan lewat Google Places yang belum gabung jadi mitra -
          direkomendasikan langsung oleh pelanggan dari aplikasi.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
              statusFilter === filter.value
                ? 'border-primary/30 bg-primary-soft text-primary'
                : 'border-border text-text-muted hover:bg-surface-hover'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-danger">{error}</p>
        ) : data.length === 0 ? (
          <p className="p-6 text-sm text-text-muted">Belum ada calon mitra di status ini.</p>
        ) : (
          <div className="divide-y divide-border">
            {data.map((lead) => (
              <div key={lead.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-text">{lead.name}</p>
                    <StatusBadge status={lead.status} />
                  </div>
                  {lead.address && (
                    <p className="mt-1 flex items-start gap-1.5 text-xs text-text-muted">
                      <MapPin size={12} className="mt-0.5 shrink-0" />
                      {lead.address}
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-text-faint">
                    {lead.google_rating && (
                      <span className="flex items-center gap-1">
                        <Star size={12} className="text-warning" />
                        {lead.google_rating} ({lead.google_rating_count ?? 0})
                      </span>
                    )}
                    {lead.referred_by && <span>Direkomendasikan oleh {lead.referred_by}</span>}
                    <span>{formatDate(lead.created_at)}</span>
                    {lead.latitude && lead.longitude && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${lead.latitude},${lead.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        Buka Maps <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => updateStatus(lead, 'contacted')}
                    disabled={busyId === lead.id || lead.status === 'contacted'}
                    className="rounded-lg border border-warning/30 px-3 py-1.5 text-xs font-medium text-warning hover:bg-warning-soft disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Dihubungi
                  </button>
                  <button
                    onClick={() => updateStatus(lead, 'converted')}
                    disabled={busyId === lead.id || lead.status === 'converted'}
                    className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Gabung
                  </button>
                  <button
                    onClick={() => updateStatus(lead, 'rejected')}
                    disabled={busyId === lead.id || lead.status === 'rejected'}
                    className="rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
