'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';

interface UseApiOptions<T> {
  fallbackData?: T;
  enabled?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  isUsingFallback: boolean;
}

export function useApi<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: UseApiOptions<T>
): UseApiResult<T> {
  const { fallbackData, enabled = true } = options ?? {};

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  // Serialize params for dependency comparison
  const paramsKey = JSON.stringify(params);
  // Use a ref to track mounted state and avoid state updates after unmount
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.get<T>(endpoint, params);
      if (mountedRef.current) {
        setData(result);
        setIsUsingFallback(false);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(message);
        if (fallbackData !== undefined) {
          setData(fallbackData);
          setIsUsingFallback(true);
        }
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, paramsKey, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch, isUsingFallback };
}

export default useApi;
