
'use server';

import { getAdminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import type { Investment } from '../types';

export async function makeInvestment(userId: string, details: { tournamentId: string, tournamentName: string, tierName: string, amount: number, tokenAmount: number }) {
  const adminDb = getAdminDb();
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
    const userRef = adminDb.collection('users').doc(userId);
    const investmentRef = adminDb.collection('investments').doc(); // Auto-generate ID

    // Note: The 'tournaments' collection is conceptual and based on mock data.
    // In a real app, this would update a live document. This may not find a doc
    // if one doesn't exist in your actual Firestore DB. We will proceed assuming it might.
    const tournamentRef = adminDb.collection('tournaments').doc(details.tournamentId);

    // Using a transaction to ensure all writes succeed or none do.
    await adminDb.runTransaction(async (transaction) => {
        // 1. Create the new investment document
        transaction.set(investmentRef, investmentData);
        
        // 2. Update user's total invested amount
        transaction.update(userRef, {
            totalInvested: FieldValue.increment(details.amount)
        });

        // 3. Update the tournament's raised amount
        // This part is likely to fail if the tournament doc doesn't exist in Firestore.
        // For robustness, we check its existence first, but this is a common issue with mock-first dev.
        const tournamentDoc = await transaction.get(tournamentRef);
        if (tournamentDoc.exists) {
            transaction.update(tournamentRef, {
                raisedAmount: FieldValue.increment(details.amount)
            });
        }
    });

    // Revalidate paths to reflect updated data
    revalidatePath(`/tournaments/${details.tournamentId}`);
    revalidatePath('/profile');
    revalidatePath('/dashboard');

    return { success: true, message: 'Investment was successful!' };
  } catch (error) {
    console.error('Error making investment:', error);
    // Check if the error is because the tournament doc doesn't exist.
    // This is a common issue when working with mock data that might not be in the DB.
    if ((error as any).code === 5) { // Firestore's NOT_FOUND error code
         return { success: false, message: 'Your investment could not be processed because the tournament record was not found in the database.' };
    }
    return { success: false, message: 'Your investment could not be processed due to a server error.' };
  }
}
