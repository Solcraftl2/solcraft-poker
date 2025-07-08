
'use server';

import { api } from '@/lib/api-config';
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
    await api.updatePlayerProfile(userId, data);
    return { success: true, message: 'Profile updated successfully.' };
  } catch (error) {
    console.error('Error updating profile:', error);
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
    await api.updatePlayerProfile(userId, { notificationSettings: settings });
    return { success: true, message: 'Notification settings updated successfully.' };
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return { success: false, message: 'Failed to update settings.' };
  }
}
