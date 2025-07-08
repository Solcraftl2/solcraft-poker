
'use server';

import type { SocialPlayer } from '../types';
import { revalidatePath } from 'next/cache';
import { api, apiCall, API_ENDPOINTS } from '@/lib/api-config';

export async function getPlayers(): Promise<SocialPlayer[]> {
  try {
    const players = await api.getPlayers();
    return players as SocialPlayer[];
  } catch (error) {
    console.error('Error fetching players from API:', error);
    return [];
  }
}

export async function toggleFollow(currentUserId: string, targetUserId: string, isCurrentlyFollowing: boolean) {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
        return { success: false, message: 'Invalid request.' };
    }

    const method = isCurrentlyFollowing ? 'DELETE' : 'POST';

    try {
        await apiCall(`${API_ENDPOINTS.playerProfile(targetUserId)}/follow`, {
            method,
            body: JSON.stringify({ userId: currentUserId }),
        });
        revalidatePath('/social');
        revalidatePath(`/profile/${targetUserId}`);
        revalidatePath('/profile');

        return { success: true, message: isCurrentlyFollowing ? 'Unfollowed successfully' : 'Followed successfully' };
    } catch (error) {
        console.error('Error toggling follow via API:', error);
        return { success: false, message: 'Could not complete the action. Please try again.' };
    }
}
