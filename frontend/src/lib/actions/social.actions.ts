
'use server';

import type { SocialPlayer } from '../types';
import { api } from '@/lib/api-config';

export async function getPlayers(): Promise<SocialPlayer[]> {
  try {
    const data = await api.getPlayers();
    return data as SocialPlayer[];
  } catch (error) {
    console.error('Error fetching players from API:', error);
    return [];
  }
}

export async function toggleFollow(
  currentUserId: string,
  targetUserId: string,
  isCurrentlyFollowing: boolean
) {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
    return { success: false, message: 'Invalid request.' };
  }

  try {
    const data = await api.toggleFollow(targetUserId);
    return { success: true, message: isCurrentlyFollowing ? 'Unfollowed successfully' : 'Followed successfully', data };
  } catch (error) {
    console.error('Error toggling follow:', error);
    return { success: false, message: 'Could not complete the action. Please try again.' };
  }
}
