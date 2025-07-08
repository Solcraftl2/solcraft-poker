"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import type { WalletAdapter } from '@solana/wallet-adapter-base';

import { 
  getSolCraftSDK, 
  initializeSolCraftSDK, 
  SolCraftSDK,
  type Network,
  type GameState,
  type TokenState,
  type StakeAccount,
  type TransactionResult
} from '@/lib/solcraft-sdk';

// Wallet info interface
export interface WalletInfo {
  name: string;
  icon: string;
  url: string;
  installed?: boolean;
}

// Enhanced wallet context interface
export interface WalletContextType {
  // Connection state
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  
  // Wallet info
  publicKey: PublicKey | null;
  walletAddress: string | null;
  walletName: string | null;
  walletAdapter: WalletAdapter | null;
  
  // Balances
  solBalance: number | null;
  tokenBalance: number | null;
  
  // SDK and network
  sdk: SolCraftSDK | null;
  network: Network;
  
  // Game state
  gameState: GameState | null;
  tokenState: TokenState | null;
  stakeAccount: StakeAccount | null;
  
  // Methods
  connect: (walletName: string) => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (network: Network) => Promise<void>;
  refreshBalances: () => Promise<void>;
  refreshGameData: () => Promise<void>;
  
  // Game methods
  createTable: (params: {
    maxPlayers: number;
    buyInAmount: number;
    smallBlind: number;
    bigBlind: number;
    ante?: number;
  }) => Promise<{ success: boolean; tableId?: string; error?: string }>;
  
  joinTable: (tableId: string) => Promise<TransactionResult>;
  
  // Token methods
  stakeTokens: (amount: number, lockDays: number) => Promise<TransactionResult>;
  claimRewards: () => Promise<TransactionResult>;
  
  // Supported wallets
  supportedWallets: WalletInfo[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Supported wallets configuration
const SUPPORTED_WALLETS: WalletInfo[] = [
  {
    name: 'Phantom',
    icon: 'https://phantom.app/img/phantom-icon.svg',
    url: 'https://phantom.app/',
  },
  {
    name: 'Solflare',
    icon: 'https://solflare.com/img/logo.svg',
    url: 'https://solflare.com/',
  },
  {
    name: 'Backpack',
    icon: 'https://backpack.app/icon.png',
    url: 'https://backpack.app/',
  },
  {
    name: 'Torus',
    icon: 'https://tor.us/images/torus-icon.svg',
    url: 'https://tor.us/',
  },
  {
    name: 'Ledger',
    icon: 'https://www.ledger.com/favicon.ico',
    url: 'https://www.ledger.com/',
  },
  {
    name: 'Glow',
    icon: 'https://glow.app/favicon.ico',
    url: 'https://glow.app/',
  },
];

interface WalletProviderProps {
  children: ReactNode;
  network?: Network;
}

export function WalletProvider({ children, network = 'devnet' }: WalletProviderProps) {
  // Connection state
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  
  // Wallet info
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [walletAdapter, setWalletAdapter] = useState<WalletAdapter | null>(null);
  
  // Balances
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  
  // SDK and network
  const [sdk, setSdk] = useState<SolCraftSDK | null>(null);
  const [currentNetwork, setCurrentNetwork] = useState<Network>(network);
  
  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [tokenState, setTokenState] = useState<TokenState | null>(null);
  const [stakeAccount, setStakeAccount] = useState<StakeAccount | null>(null);
  
  // Supported wallets with installation detection
  const [supportedWallets, setSupportedWallets] = useState<WalletInfo[]>(SUPPORTED_WALLETS);

  /**
   * Detect installed wallets
   */
  const detectInstalledWallets = useCallback(() => {
    if (typeof window === 'undefined') return;

    const updatedWallets = SUPPORTED_WALLETS.map(wallet => ({
      ...wallet,
      installed: detectWallet(wallet.name) !== null
    }));

    setSupportedWallets(updatedWallets);
  }, []);

  /**
   * Detect specific wallet
   */
  const detectWallet = (walletName: string): any => {
    if (typeof window === 'undefined') return null;
    
    switch (walletName.toLowerCase()) {
      case 'phantom':
        return (window as any).phantom?.solana;
      case 'solflare':
        return (window as any).solflare;
      case 'backpack':
        return (window as any).backpack;
      case 'torus':
        return (window as any).torus;
      default:
        return null;
    }
  };

  /**
   * Create mock wallet adapter for non-installed wallets
   */
  const createMockAdapter = (walletName: string): WalletAdapter => {
    const mockAddress = generateSimulatedAddress(walletName);
    
    return {
      name: walletName,
      url: supportedWallets.find(w => w.name === walletName)?.url || '',
      icon: supportedWallets.find(w => w.name === walletName)?.icon || '',
      readyState: 'Installed' as any,
      publicKey: new PublicKey(mockAddress),
      connecting: false,
      connected: true,
      
      connect: async () => ({ publicKey: new PublicKey(mockAddress) }),
      disconnect: async () => {},
      sendTransaction: async () => 'mock_signature',
      signTransaction: async (tx: any) => tx,
      signAllTransactions: async (txs: any[]) => txs,
      signMessage: async (message: Uint8Array) => new Uint8Array(64),
      
      on: () => {},
      off: () => {},
      emit: () => {},
      listenerCount: () => 0,
      listeners: () => [],
      removeAllListeners: () => {},
    } as any;
  };

  /**
   * Generate simulated address for demo wallets
   */
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

  /**
   * Connect wallet
   */
  const connect = async (selectedWalletName: string): Promise<void> => {
    if (connecting) return;
    
    setConnecting(true);
    
    try {
      let adapter: WalletAdapter;
      const walletProvider = detectWallet(selectedWalletName);
      
      if (!walletProvider) {
        // Use mock adapter for demo
        console.log(`${selectedWalletName} not installed, using demo mode`);
        adapter = createMockAdapter(selectedWalletName);
      } else {
        // Create real adapter (simplified - in real app would use @solana/wallet-adapter)
        adapter = {
          name: selectedWalletName,
          publicKey: null,
          connected: false,
          connecting: false,
          
          connect: async () => {
            const response = await walletProvider.connect();
            return response;
          },
          disconnect: async () => {
            if (walletProvider.disconnect) {
              await walletProvider.disconnect();
            }
          },
          
          // Other required methods...
        } as any;
        
        await adapter.connect!();
      }

      if (adapter.publicKey) {
        setWalletAdapter(adapter);
        setPublicKey(adapter.publicKey);
        setWalletAddress(adapter.publicKey.toString());
        setWalletName(selectedWalletName);
        setConnected(true);
        
        // Initialize SDK
        const sdkInstance = await initializeSolCraftSDK(adapter, currentNetwork);
        setSdk(sdkInstance);
        
        // Save to localStorage
        localStorage.setItem('wallet_connected', 'true');
        localStorage.setItem('wallet_name', selectedWalletName);
        localStorage.setItem('wallet_address', adapter.publicKey.toString());
        
        // Refresh data
        await refreshBalances();
        await refreshGameData();
      }
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw new Error(`Failed to connect to ${selectedWalletName}`);
    } finally {
      setConnecting(false);
    }
  };

  /**
   * Disconnect wallet
   */
  const disconnect = async (): Promise<void> => {
    if (disconnecting) return;
    
    setDisconnecting(true);
    
    try {
      if (walletAdapter && walletAdapter.disconnect) {
        await walletAdapter.disconnect();
      }
      
      // Clear state
      setConnected(false);
      setPublicKey(null);
      setWalletAddress(null);
      setWalletName(null);
      setWalletAdapter(null);
      setSdk(null);
      setSolBalance(null);
      setTokenBalance(null);
      setGameState(null);
      setTokenState(null);
      setStakeAccount(null);
      
      // Clear localStorage
      localStorage.removeItem('wallet_connected');
      localStorage.removeItem('wallet_name');
      localStorage.removeItem('wallet_address');
      
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    } finally {
      setDisconnecting(false);
    }
  };

  /**
   * Switch network
   */
  const switchNetwork = async (newNetwork: Network): Promise<void> => {
    try {
      setCurrentNetwork(newNetwork);
      
      if (sdk) {
        await sdk.switchNetwork(newNetwork);
        await refreshBalances();
        await refreshGameData();
      }
    } catch (error) {
      console.error('Error switching network:', error);
      throw error;
    }
  };

  /**
   * Refresh balances
   */
  const refreshBalances = async (): Promise<void> => {
    if (!sdk || !publicKey) return;
    
    try {
      const [sol, token] = await Promise.all([
        sdk.getSolBalance(publicKey),
        // sdk.getTokenBalance(SOLP_MINT, publicKey) // Would need SOLP mint address
        Promise.resolve(Math.random() * 1000) // Mock for now
      ]);
      
      setSolBalance(sol);
      setTokenBalance(token);
    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
  };

  /**
   * Refresh game data
   */
  const refreshGameData = async (): Promise<void> => {
    if (!sdk) return;
    
    try {
      const [gameStateData, tokenStateData, stakeAccountData] = await Promise.all([
        sdk.getGameState(),
        sdk.getTokenState(),
        publicKey ? sdk.getStakeAccount(publicKey) : null
      ]);
      
      setGameState(gameStateData);
      setTokenState(tokenStateData);
      setStakeAccount(stakeAccountData);
    } catch (error) {
      console.error('Error refreshing game data:', error);
    }
  };

  /**
   * Create poker table
   */
  const createTable = async (params: {
    maxPlayers: number;
    buyInAmount: number;
    smallBlind: number;
    bigBlind: number;
    ante?: number;
  }) => {
    if (!sdk) throw new Error('SDK not initialized');
    return sdk.createTable(params);
  };

  /**
   * Join poker table
   */
  const joinTable = async (tableId: string): Promise<TransactionResult> => {
    if (!sdk) throw new Error('SDK not initialized');
    return sdk.joinTable(tableId);
  };

  /**
   * Stake tokens
   */
  const stakeTokens = async (amount: number, lockDays: number): Promise<TransactionResult> => {
    if (!sdk) throw new Error('SDK not initialized');
    return sdk.stakeTokens(amount, lockDays);
  };

  /**
   * Claim staking rewards
   */
  const claimRewards = async (): Promise<TransactionResult> => {
    if (!sdk) throw new Error('SDK not initialized');
    return sdk.claimRewards();
  };

  // Initialize on mount
  useEffect(() => {
    detectInstalledWallets();
    
    // Try to restore connection
    const savedConnected = localStorage.getItem('wallet_connected');
    const savedWalletName = localStorage.getItem('wallet_name');
    const savedWalletAddress = localStorage.getItem('wallet_address');
    
    if (savedConnected === 'true' && savedWalletName && savedWalletAddress) {
      // Auto-reconnect in demo mode
      connect(savedWalletName).catch(console.error);
    }
  }, []);

  // Refresh data periodically
  useEffect(() => {
    if (!connected || !sdk) return;
    
    const interval = setInterval(() => {
      refreshBalances();
      refreshGameData();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [connected, sdk]);

  const value: WalletContextType = {
    // Connection state
    connected,
    connecting,
    disconnecting,
    
    // Wallet info
    publicKey,
    walletAddress,
    walletName,
    walletAdapter,
    
    // Balances
    solBalance,
    tokenBalance,
    
    // SDK and network
    sdk,
    network: currentNetwork,
    
    // Game state
    gameState,
    tokenState,
    stakeAccount,
    
    // Methods
    connect,
    disconnect,
    switchNetwork,
    refreshBalances,
    refreshGameData,
    
    // Game methods
    createTable,
    joinTable,
    
    // Token methods
    stakeTokens,
    claimRewards,
    
    // Supported wallets
    supportedWallets,
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
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

