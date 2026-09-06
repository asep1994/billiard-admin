'use client';

import { Building2 } from 'lucide-react';
import { useActiveVenue } from '@/lib/activeVenue';

export function VenueSwitcher() {
  const { venues, activeVenueId, setActiveVenueId, isLoading } = useActiveVenue();

  if (isLoading || venues.length <= 1) return null;

  return (
    <div className="hidden items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 sm:flex">
      <Building2 size={14} className="shrink-0 text-text-faint" />
      <select
        value={activeVenueId ?? ''}
        onChange={(event) => setActiveVenueId(Number(event.target.value))}
        className="max-w-[10rem] truncate bg-transparent text-sm text-text outline-none"
      >
        {venues.map((venue) => (
          <option key={venue.id} value={venue.id}>
            {venue.name}
          </option>
        ))}
      </select>
    </div>
  );
}
