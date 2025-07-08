
'use server';

import { revalidatePath } from 'next/cache';
import { api, apiCall, API_ENDPOINTS } from '@/lib/api-config';
import type { UserProfile } from '../types';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;
  try {
    const data = await api.getPlayerProfile(userId);
    return data as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile from API:', error);
    return null;
  }
}

interface UserProfileUpdateData {
  name: string;
  username: string;
  bio: string;
}

export async function updateProfile(userId: string, data: UserProfileUpdateData) {
  if (!userId) {
    return { success: false, message: 'User not authenticated.' };
  }
  try {
    await apiCall(API_ENDPOINTS.playerProfile(userId), {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    revalidatePath('/settings');
    revalidatePath('/profile');

    return { success: true, message: 'Profile updated successfully.' };
  } catch (error) {
    console.error('Error updating profile via API:', error);
    return { success: false, message: 'Failed to update profile.' };
  }
}

interface NotificationSettings {
    investmentUpdates: boolean;
    newTournaments: boolean;
    socialActivity: boolean;
    platformNews: boolean;
}

export async function updateNotificationSettings(userId: string, settings: NotificationSettings) {
    if (!userId) {
        return { success: false, message: 'User not authenticated.' };
    }
    try {
        await apiCall(API_ENDPOINTS.playerProfile(userId), {
            method: 'PUT',
            body: JSON.stringify({ notificationSettings: settings })
        });
        revalidatePath('/settings');
        return { success: true, message: 'Notification settings updated successfully.' };
    } catch (error) {
        console.error('Error updating notification settings via API:', error);
        return { success: false, message: 'Failed to update settings.' };
    }
}
