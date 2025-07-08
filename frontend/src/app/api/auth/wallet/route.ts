import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { getAdminAuth } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { publicKey, message, signature } = await req.json();
    if (!publicKey || !message || !signature) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const sigBytes = bs58.decode(signature);
    const msgBytes = new TextEncoder().encode(message);
    const pk = new PublicKey(publicKey);

    const valid = nacl.sign.detached.verify(msgBytes, sigBytes, pk.toBytes());
    if (!valid) {
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
    }

    const auth = getAdminAuth();
    const token = await auth.createCustomToken(publicKey);
    return NextResponse.json({ token });
  } catch (e) {
    console.error('wallet auth error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
