
'use server';

import { getAdminDb } from '@/lib/firebaseAdmin';
import type { SocialPlayer } from '../types';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

export async function getPlayers(): Promise<SocialPlayer[]> {
  const adminDb = getAdminDb();
  try {
    const usersSnapshot = await adminDb.collection('users')
      .orderBy('ranking')
      .limit(50)
      .get();
      
    if (usersSnapshot.empty) {
      return [];
    }

    const players = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        uid: doc.id,
        // isFollowed is a client-side concern, determined by the logged-in user
      } as SocialPlayer;
    });
    
    return players;
  } catch (error) {
    console.error("Error fetching players from Firestore:", error);
    return [];
  }
}

export async function toggleFollow(currentUserId: string, targetUserId: string, isCurrentlyFollowing: boolean) {
    const adminDb = getAdminDb();
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
        return { success: false, message: 'Invalid request.' };
    }
    
    const currentUserRef = adminDb.collection('users').doc(currentUserId);
    const targetUserRef = adminDb.collection('users').doc(targetUserId);

    const batch = adminDb.batch();

    if (isCurrentlyFollowing) {
        // Unfollow action
        batch.update(currentUserRef, { followingCount: FieldValue.increment(-1) });
        batch.update(targetUserRef, { followersCount: FieldValue.increment(-1) });
    } else {
        // Follow action
        batch.update(currentUserRef, { followingCount: FieldValue.increment(1) });
        batch.update(targetUserRef, { followersCount: FieldValue.increment(1) });
    }

    try {
        await batch.commit();
        // Revalidate paths to reflect updated data for both users
        revalidatePath('/social');
        revalidatePath(`/profile/${targetUserId}`); // Assuming profile page uses ID
        revalidatePath('/profile'); // Revalidate current user's profile page
        
        return { success: true, message: isCurrentlyFollowing ? 'Unfollowed successfully' : 'Followed successfully' };
    } catch (error) {
        console.error('Error toggling follow:', error);
        return { success: false, message: 'Could not complete the action. Please try again.' };
    }
}
