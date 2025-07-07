
'use server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import type { SupportTicket } from '../types';

export async function submitSupportTicket(formData: {name: string, email: string, subject: string, message: string}, userId?: string) {
    const adminDb = getAdminDb();
    const ticketData: SupportTicket = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        createdAt: new Date().toISOString(),
        status: 'open',
    };

    if (userId) {
        ticketData.userId = userId;
    }

    try {
        await adminDb.collection('supportTickets').add(ticketData);
        return { success: true, message: 'Support ticket submitted successfully!' };
    } catch (error) {
        console.error('Error submitting support ticket:', error);
        return { success: false, message: 'Failed to submit your support ticket. Please try again later.' };
    }
}
