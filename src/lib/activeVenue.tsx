'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from './api';
import type { Venue } from './types';

interface ActiveVenueContextValue {
  venues: Venue[];
  activeVenueId: number | null;
  activeVenue: Venue | null;
  setActiveVenueId: (id: number) => void;
  isLoading: boolean;
  refetch: () => void;
}

const ActiveVenueContext = createContext<ActiveVenueContextValue | null>(null);

const STORAGE_KEY = 'billiard_active_venue';

export function ActiveVenueProvider({
  vendorId,
  children,
}: {
  vendorId: number | null;
  children: React.ReactNode;
}) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [activeVenueId, setActiveVenueIdState] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(vendorId));

  const refetch = useCallback(() => {
    if (!vendorId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    apiFetch<{ data: Venue[] }>('/venues?per_page=100')
      .then((res) => {
        setVenues(res.data);
        setActiveVenueIdState((prev) => {
          if (prev && res.data.some((venue) => venue.id === prev)) return prev;

          let stored: number | null = null;
          try {
            stored = Number(localStorage.getItem(STORAGE_KEY)) || null;
          } catch {
            stored = null;
          }

          if (stored && res.data.some((venue) => venue.id === stored)) return stored;

          return res.data[0]?.id ?? null;
        });
      })
      .finally(() => setIsLoading(false));
  }, [vendorId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount/vendor-change, the standard data-fetching effect shape
    refetch();
  }, [refetch]);

  const setActiveVenueId = useCallback((id: number) => {
    setActiveVenueIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, String(id));
    } catch {
      // selection just won't persist across reloads
    }
  }, []);

  const activeVenue = useMemo(
    () => venues.find((venue) => venue.id === activeVenueId) ?? null,
    [venues, activeVenueId],
  );

  const value = useMemo(
    () => ({ venues, activeVenueId, activeVenue, setActiveVenueId, isLoading, refetch }),
    [venues, activeVenueId, activeVenue, setActiveVenueId, isLoading, refetch],
  );

  return <ActiveVenueContext.Provider value={value}>{children}</ActiveVenueContext.Provider>;
}

export function useActiveVenue(): ActiveVenueContextValue {
  const context = useContext(ActiveVenueContext);

  if (!context) {
    throw new Error('useActiveVenue must be used within an ActiveVenueProvider');
  }

  return context;
}
