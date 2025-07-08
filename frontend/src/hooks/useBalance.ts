"use client";

import { useEffect, useState } from 'react';
import { fetchBalance, type Balance } from '@/lib/api/balance';

export function useBalance(userId?: string) {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setBalance(null);
      return;
    }

    setLoading(true);
    fetchBalance(userId)
      .then((data) => {
        setBalance(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load balance', err);
        setError('Failed to load balance');
        setBalance(null);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return { balance, loading, error };
}
