
'use server';

import { revalidatePath } from 'next/cache';
import { apiCall, API_ENDPOINTS } from '@/lib/api-config';
import type { Investment } from '../types';

export async function makeInvestment(userId: string, details: { tournamentId: string, tournamentName: string, tierName: string, amount: number, tokenAmount: number }) {
  if (!userId || !details || !details.tournamentId || details.amount <= 0) {
    return { success: false, message: 'Invalid investment data provided.' };
  }

  const investmentData: Omit<Investment, 'id'> = {
    investorId: userId,
    tournamentId: details.tournamentId,
    tournamentName: details.tournamentName,
    tierName: details.tierName,
    investmentValueUSD: details.amount,
    tokenAmount: details.tokenAmount,
    investmentDate: new Date().toISOString(),
    status: 'Active',
  };

  try {
    await apiCall(`${API_ENDPOINTS.tournamentById(details.tournamentId)}/invest`, {
      method: 'POST',
      body: JSON.stringify({ userId, amount: details.amount, tierName: details.tierName }),
    });

    // Revalidate paths to reflect updated data
    revalidatePath(`/tournaments/${details.tournamentId}`);
    revalidatePath('/profile');
    revalidatePath('/dashboard');

    return { success: true, message: 'Investment was successful!' };
  } catch (error) {
    console.error('Error making investment via API:', error);
    return { success: false, message: 'Your investment could not be processed due to a server error.' };
  }
}
