'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, ApiError } from './api';
import type { Paginated, PaginationMeta } from './types';

interface UseApiListResult<T> {
  data: T[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApiList<T>(path: string | null): UseApiListResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!path) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    apiFetch<Paginated<T>>(path)
      .then((response) => {
        setData(response.data);
        setMeta(response.meta);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Gagal memuat data.');
      })
      .finally(() => setIsLoading(false));
  }, [path]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount/path-change, the standard data-fetching effect shape
    refetch();
  }, [refetch]);

  return { data, meta, isLoading, error, refetch };
}
