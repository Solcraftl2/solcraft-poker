import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const { walletAddress } = await req.json();
    if (!walletAddress) {
      return NextResponse.json({ error: 'walletAddress required' }, { status: 400 });
    }
    const token = await getAdminAuth().createCustomToken(walletAddress);
    return NextResponse.json({ token });
  } catch (e) {
    console.error('Error creating custom token', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
