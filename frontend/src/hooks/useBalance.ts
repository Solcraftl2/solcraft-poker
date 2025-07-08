"use client";
import { useEffect, useState, useCallback } from 'react';
import { fetchUserBalance, BalanceResponse } from '@/lib/api/balance';

export function useBalance(userId?: string) {
  const [data, setData] = useState<BalanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchUserBalance(userId);
      setData(res);
    } catch (err: any) {
      console.error('useBalance error:', err);
      setError(err.message || 'Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refresh: load };
}
