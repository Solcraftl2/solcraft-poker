export interface BalanceData {
  amount: number;
  currency: string;
}

export interface BalanceResponse {
  balance: BalanceData | null;
  walletAddress: string | null;
}

export async function fetchUserBalance(userId: string): Promise<BalanceResponse> {
  const res = await fetch(`/api/balance/${userId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch balance');
  }
  return res.json();
}
