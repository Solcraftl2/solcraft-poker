
'use server';
import type { SupportTicket } from '../types';
import { apiCall, API_ENDPOINTS } from '@/lib/api-config';

export async function submitSupportTicket(formData: {name: string, email: string, subject: string, message: string}, userId?: string) {
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
        await apiCall(`${API_ENDPOINTS.guarantees}/support`, {
            method: 'POST',
            body: JSON.stringify(ticketData),
        });
        return { success: true, message: 'Support ticket submitted successfully!' };
    } catch (error) {
        console.error('Error submitting support ticket via API:', error);
        return { success: false, message: 'Failed to submit your support ticket. Please try again later.' };
    }
}
