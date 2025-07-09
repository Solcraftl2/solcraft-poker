'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Tipi per il wallet
interface WalletInfo {
  name: string;
  icon: string;
  installed: boolean;
}

interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  wallets: WalletInfo[];
  connect: (walletName: string) => Promise<void>;
  disconnect: () => void;
}

// Context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Wallet provider
interface WalletProviderProps {
  children: ReactNode;
}

export function SimpleWalletProvider({ children }: WalletProviderProps) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  // Lista dei wallet disponibili
  const wallets: WalletInfo[] = [
    { name: 'Phantom', icon: 'P', installed: typeof window !== 'undefined' && 'solana' in window },
    { name: 'Solflare', icon: 'S', installed: false },
    { name: 'Backpack', icon: 'B', installed: false },
    { name: 'Torus', icon: 'T', installed: false },
    { name: 'Ledger', icon: 'L', installed: false },
    { name: 'Glow', icon: 'G', installed: false },
  ];

  const connect = useCallback(async (walletName: string) => {
    setConnecting(true);
    
    try {
      // Simula la connessione al wallet
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (walletName === 'Phantom' && typeof window !== 'undefined' && 'solana' in window) {
        // Prova la connessione reale a Phantom se disponibile
        try {
          const provider = (window as any).solana;
          if (provider?.isPhantom) {
            const response = await provider.connect();
            setPublicKey(response.publicKey.toString());
            setConnected(true);
            return;
          }
        } catch (error) {
          console.log('Phantom connection failed, using simulation');
        }
      }
      
      // Fallback: simula la connessione
      setPublicKey('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
      setConnected(true);
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setPublicKey(null);
  }, []);

  const value: WalletContextType = {
    connected,
    connecting,
    publicKey,
    wallets,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Hook per usare il wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

