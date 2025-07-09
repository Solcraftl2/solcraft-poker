'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

export function useWalletConnection() {
  const { wallet, connected, connecting, publicKey, disconnect } = useWallet();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    setIsConnected(connected);
    setWalletAddress(publicKey ? publicKey.toString() : null);
    
    // Store wallet connection state in localStorage for persistence
    if (connected && publicKey && wallet) {
      localStorage.setItem('solcraft_wallet', JSON.stringify({
        name: wallet.adapter.name,
        address: publicKey.toString(),
        connected: true,
        connectedAt: new Date().toISOString()
      }));
    } else {
      localStorage.removeItem('solcraft_wallet');
    }
  }, [connected, publicKey, wallet]);

  const disconnectWallet = async () => {
    try {
      await disconnect();
      localStorage.removeItem('solcraft_wallet');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const getShortAddress = (address: string | null) => {
    if (!address) return null;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return {
    wallet,
    isConnected,
    connecting,
    walletAddress,
    shortAddress: getShortAddress(walletAddress),
    walletName: wallet?.adapter.name || null,
    disconnect: disconnectWallet,
  };
}

