
'use server';

import { api } from '@/lib/api-config';

interface InvestmentResponse {
  status: string;
  message: string;
  data?: any;
}

export async function makeInvestment(
  userId: string,
  details: {
    tournamentId: string;
    tournamentName?: string;
    tierName?: string;
    amount: number;
    tokenAmount?: number;
  }
) {
  if (!userId || !details?.tournamentId || details.amount <= 0) {
    return { success: false, message: 'Invalid investment data provided.' };
  }

  try {
    const result = await api.createInvestment({
      user_id: userId,
      tournament_id: details.tournamentId,
      amount: details.amount,
    }) as InvestmentResponse;

    if (result.status === 'success') {
      return { success: true, message: 'Investment was successful!' };
    }

    return { success: false, message: result.message };
  } catch (error) {
    console.error('Error making investment:', error);
    return { success: false, message: 'Failed to create investment.' };
  }
}
