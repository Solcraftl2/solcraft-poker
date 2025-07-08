import type { NextApiRequest, NextApiResponse } from 'next';
import { getAdminDb } from '@/lib/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  try {
    const db = getAdminDb();
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    const data = doc.data();
    const balance = data?.balance || { amount: 0, currency: 'USD' };
    return res.status(200).json({ balance });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
