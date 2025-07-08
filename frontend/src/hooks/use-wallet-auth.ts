"use client";

import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useWalletAuth() {
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    const authenticate = async () => {
      if (connected && publicKey) {
        try {
          const res = await fetch("/api/wallet-auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ walletAddress: publicKey.toString() }),
          });
          const data = await res.json();
          if (data.token) {
            await signInWithCustomToken(auth, data.token);
          }
        } catch (e) {
          console.error("Wallet authentication failed", e);
        }
      }
    };

    authenticate();
  }, [connected, publicKey]);
}
