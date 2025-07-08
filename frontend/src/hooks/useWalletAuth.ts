"use client";

import { useCallback, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useWalletAuth() {
  const { publicKey, signMessage, connected } = useWallet();
  const [loading, setLoading] = useState(false);

  const login = useCallback(async () => {
    if (!publicKey || !signMessage) throw new Error("Wallet not connected");
    const message = `Sign in to SolCraft Poker with address ${publicKey.toBase58()}`;
    const encodedMessage = new TextEncoder().encode(message);
    const signature = await signMessage(encodedMessage);
    const signatureStr = bs58.encode(signature);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey: publicKey.toBase58(), message, signature: signatureStr })
      });
      if (!res.ok) throw new Error("Failed to authenticate");
      const { token } = await res.json();
      await signInWithCustomToken(auth, token);
    } finally {
      setLoading(false);
    }
  }, [publicKey, signMessage]);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  return { connected, publicKey, login, logout, loading };
}
