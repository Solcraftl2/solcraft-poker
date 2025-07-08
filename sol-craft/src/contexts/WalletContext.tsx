"use client";

import { createContext, useContext, useState, useEffect } from 'react';

// Tipi semplificati
export interface WalletInfo {
  name: string;
  icon: string;
}

export interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  publicKey: any;
  walletAddress: string | null;
  walletName: string | null;
  balance: number | null;
  connection: any;
  connect: (walletName: string) => Promise<void>;
  disconnect: () => Promise<void>;
  getBalance: () => Promise<number>;
  supportedWallets: WalletInfo[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Wallet supportati
const SUPPORTED_WALLETS: WalletInfo[] = [
  { name: 'Phantom', icon: 'https://placehold.co/48x48/A06FFA/FFFFFF.png?text=P' },
  { name: 'Solflare', icon: 'https://placehold.co/48x48/F07A00/FFFFFF.png?text=S' },
  { name: 'Backpack', icon: 'https://placehold.co/48x48/8A2BE2/FFFFFF.png?text=B' },
  { name: 'Torus', icon: 'https://placehold.co/48x48/0074FF/FFFFFF.png?text=T' },
  { name: 'Ledger', icon: 'https://placehold.co/48x48/4A4A4A/FFFFFF.png?text=L' },
  { name: 'Glow', icon: 'https://placehold.co/48x48/FFA500/000000.png?text=G' },
];

interface WalletProviderProps {
  children: any;
  network?: 'mainnet-beta' | 'testnet' | 'devnet';
}

export function WalletProvider({ children, network = 'devnet' }: WalletProviderProps) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  
  const connection = null; // Semplificato per ora

  const detectWallet = (walletName: string): any => {
    if (typeof window === 'undefined') return null;
    
    switch (walletName.toLowerCase()) {
      case 'phantom':
        return (window as any).phantom?.solana;
      case 'solflare':
        return (window as any).solflare;
      case 'backpack':
        return (window as any).backpack;
      default:
        return null;
    }
  };

  const connect = async (selectedWalletName: string): Promise<void> => {
    if (connecting) return;
    
    setConnecting(true);
    
    try {
      const walletAdapter = detectWallet(selectedWalletName);
      
      if (!walletAdapter) {
        // Simulazione per wallet non installati
        console.log(`${selectedWalletName} wallet not detected, simulating connection...`);
        
        const simulatedAddress = generateSimulatedAddress(selectedWalletName);
        
        setPublicKey(simulatedAddress);
        setWalletAddress(simulatedAddress);
        setWalletName(selectedWalletName);
        setConnected(true);
        setBalance(Math.random() * 10);
        
        localStorage.setItem('wallet_connected', 'true');
        localStorage.setItem('wallet_name', selectedWalletName);
        localStorage.setItem('wallet_address', simulatedAddress);
        
        return;
      }

      // Connessione reale per wallet installati
      if (walletAdapter.isConnected) {
        await walletAdapter.disconnect();
      }
      
      const response = await walletAdapter.connect();
      const pubKey = response.publicKey || walletAdapter.publicKey;
      
      if (pubKey) {
        setPublicKey(pubKey);
        setWalletAddress(pubKey.toString());
        setWalletName(selectedWalletName);
        setConnected(true);
        setBalance(Math.random() * 10);
        
        localStorage.setItem('wallet_connected', 'true');
        localStorage.setItem('wallet_name', selectedWalletName);
        localStorage.setItem('wallet_address', pubKey.toString());
      }
      
    } catch (error) {
      console.error('Errore connessione wallet:', error);
      throw new Error(`Impossibile connettersi a ${selectedWalletName}`);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async (): Promise<void> => {
    if (disconnecting) return;
    
    setDisconnecting(true);
    
    try {
      if (walletName) {
        const walletAdapter = detectWallet(walletName);
        if (walletAdapter && walletAdapter.disconnect) {
          await walletAdapter.disconnect();
        }
      }
      
      setConnected(false);
      setPublicKey(null);
      setWalletAddress(null);
      setWalletName(null);
      setBalance(null);
      
      localStorage.removeItem('wallet_connected');
      localStorage.removeItem('wallet_name');
      localStorage.removeItem('wallet_address');
      
    } catch (error) {
      console.error('Errore disconnessione wallet:', error);
    } finally {
      setDisconnecting(false);
    }
  };

  const getBalance = async (): Promise<number> => {
    return Math.random() * 10;
  };

  const generateSimulatedAddress = (walletName: string): string => {
    const prefixes: { [key: string]: string } = {
      'Phantom': '11111111111111111111111111111111',
      'Solflare': '22222222222222222222222222222222',
      'Backpack': '33333333333333333333333333333333',
      'Torus': '44444444444444444444444444444444',
      'Ledger': '55555555555555555555555555555555',
      'Glow': '66666666666666666666666666666666'
    };
    
    const prefix = prefixes[walletName] || '99999999999999999999999999999999';
    const randomSuffix = Math.random().toString(36).substring(2, 12).toUpperCase();
    return prefix.substring(0, 32 - randomSuffix.length) + randomSuffix;
  };

  useEffect(() => {
    const savedConnected = localStorage.getItem('wallet_connected');
    const savedWalletName = localStorage.getItem('wallet_name');
    const savedWalletAddress = localStorage.getItem('wallet_address');
    
    if (savedConnected === 'true' && savedWalletName && savedWalletAddress) {
      try {
        setPublicKey(savedWalletAddress);
        setWalletAddress(savedWalletAddress);
        setWalletName(savedWalletName);
        setConnected(true);
        setBalance(Math.random() * 10);
      } catch (error) {
        console.error('Errore ripristino wallet:', error);
        localStorage.removeItem('wallet_connected');
        localStorage.removeItem('wallet_name');
        localStorage.removeItem('wallet_address');
      }
    }
  }, []);

  const value: WalletContextType = {
    connected,
    connecting,
    disconnecting,
    publicKey,
    walletAddress,
    walletName,
    balance,
    connection,
    connect,
    disconnect,
    getBalance,
    supportedWallets: SUPPORTED_WALLETS,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet deve essere usato all\'interno di WalletProvider');
  }
  return context;
}

