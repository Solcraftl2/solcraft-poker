export interface Balance {
  amount: number;
  currency: string;
}

export async function fetchBalance(userId: string): Promise<Balance> {
  const res = await fetch(`/api/balance/${userId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch balance');
  }
  const data = await res.json();
  return data.balance as Balance;
}
