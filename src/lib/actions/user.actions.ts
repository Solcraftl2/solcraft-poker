
'use server';

import { getAdminDb } from '@/lib/firebaseAdmin';
import { revalidatePath } from 'next/cache';
import type { UserProfile } from '../types';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const adminDb = getAdminDb();
  if (!userId) return null;
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.log(`No user profile found for UID: ${userId}`);
      return null;
    }
    const data = userDoc.data() as UserProfile;
    // Ensure id is part of the returned object
    return { ...data, id: userDoc.id, uid: userDoc.id };
  } catch (error) {
    console.error("Error fetching user profile from Firestore:", error);
    return null;
  }
}

interface UserProfileUpdateData {
  name: string;
  username: string;
  bio: string;
}

export async function updateProfile(userId: string, data: UserProfileUpdateData) {
  const adminDb = getAdminDb();
  if (!userId) {
    return { success: false, message: 'User not authenticated.' };
  }
  try {
    const userDocRef = adminDb.collection('users').doc(userId);
    await userDocRef.update({
      name: data.name,
      username: data.username,
      bio: data.bio,
    });

    revalidatePath('/settings');
    revalidatePath('/profile');

    return { success: true, message: 'Profile updated successfully.' };
  } catch (error) {
    console.error("Error updating profile in Firestore:", error);
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
    const adminDb = getAdminDb();
    if (!userId) {
        return { success: false, message: 'User not authenticated.' };
    }
    try {
        const userDocRef = adminDb.collection('users').doc(userId);
        await userDocRef.update({ notificationSettings: settings });
        revalidatePath('/settings');
        return { success: true, message: 'Notification settings updated successfully.' };
    } catch (error) {
        console.error("Error updating notification settings:", error);
        return { success: false, message: 'Failed to update settings.' };
    }
}
