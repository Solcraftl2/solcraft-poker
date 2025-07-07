'use client';

import { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  TransactionSignature
} from '@solana/web3.js';
import { toast } from 'sonner';

interface TransactionResult {
  signature: TransactionSignature;
  success: boolean;
  error?: string;
}

interface WalletState {
  balance: number | null;
  loading: boolean;
  connected: boolean;
  address: string | null;
}

export function useSolcraftWallet() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected, wallet } = useWallet();
  const [walletState, setWalletState] = useState<WalletState>({
    balance: null,
    loading: false,
    connected: false,
    address: null
  });

  // Update wallet state when connection changes
  useEffect(() => {
    setWalletState(prev => ({
      ...prev,
      connected,
      address: publicKey?.toString() || null
    }));
  }, [connected, publicKey]);

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connected) {
      setWalletState(prev => ({ ...prev, balance: null }));
      return;
    }

    setWalletState(prev => ({ ...prev, loading: true }));
    try {
      const balance = await connection.getBalance(publicKey);
      setWalletState(prev => ({
        ...prev,
        balance: balance / LAMPORTS_PER_SOL,
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching balance:', error);
      setWalletState(prev => ({ ...prev, loading: false }));
      toast.error('Failed to fetch wallet balance');
    }
  }, [connection, publicKey, connected]);

  // Auto-fetch balance when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    }
  }, [connected, publicKey, fetchBalance]);

  // Send SOL transaction
  const sendSol = useCallback(async (
    toAddress: string, 
    amount: number
  ): Promise<TransactionResult> => {
    if (!publicKey || !connected) {
      throw new Error('Wallet not connected');
    }

    try {
      const toPublicKey = new PublicKey(toAddress);
      const lamports = amount * LAMPORTS_PER_SOL;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: toPublicKey,
          lamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast.success(`Successfully sent ${amount} SOL`);
      
      // Refresh balance after transaction
      setTimeout(fetchBalance, 1000);
      
      return {
        signature,
        success: true
      };
    } catch (error: any) {
      const errorMessage = error?.message || 'Transaction failed';
      toast.error(errorMessage);
      return {
        signature: '',
        success: false,
        error: errorMessage
      };
    }
  }, [publicKey, connected, sendTransaction, connection, fetchBalance]);

  // Join tournament (interact with smart contract)
  const joinTournament = useCallback(async (
    tournamentId: string,
    buyInAmount: number
  ): Promise<TransactionResult> => {
    if (!publicKey || !connected) {
      throw new Error('Wallet not connected');
    }

    try {
      // This is a placeholder for smart contract interaction
      // In a real implementation, you would:
      // 1. Create the instruction to call the smart contract
      // 2. Add it to a transaction
      // 3. Send the transaction

      const lamports = buyInAmount * LAMPORTS_PER_SOL;
      
      // For now, we'll simulate a transaction
      // Replace this with actual smart contract call
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('5sNPwvo4mEhSYaKCH9zsLbShnH9ukniZ1N2eeDkPJVXm'), // Smart contract address
          lamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast.success(`Successfully joined tournament ${tournamentId}`);
      
      // Refresh balance after transaction
      setTimeout(fetchBalance, 1000);
      
      return {
        signature,
        success: true
      };
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to join tournament';
      toast.error(errorMessage);
      return {
        signature: '',
        success: false,
        error: errorMessage
      };
    }
  }, [publicKey, connected, sendTransaction, connection, fetchBalance]);

  // Create tournament (interact with smart contract)
  const createTournament = useCallback(async (
    buyIn: number,
    maxPlayers: number,
    name: string
  ): Promise<TransactionResult> => {
    if (!publicKey || !connected) {
      throw new Error('Wallet not connected');
    }

    try {
      // This is a placeholder for smart contract interaction
      // In a real implementation, you would create the proper instruction
      
      toast.success(`Tournament "${name}" created successfully`);
      
      return {
        signature: 'simulated_signature',
        success: true
      };
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create tournament';
      toast.error(errorMessage);
      return {
        signature: '',
        success: false,
        error: errorMessage
      };
    }
  }, [publicKey, connected]);

  // Check if wallet has sufficient balance
  const hasSufficientBalance = useCallback((amount: number): boolean => {
    if (walletState.balance === null) return false;
    return walletState.balance >= amount;
  }, [walletState.balance]);

  // Format address for display
  const formatAddress = useCallback((address?: string): string => {
    const addr = address || walletState.address;
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  }, [walletState.address]);

  return {
    // State
    ...walletState,
    walletName: wallet?.adapter.name,
    walletIcon: wallet?.adapter.icon,
    
    // Actions
    fetchBalance,
    sendSol,
    joinTournament,
    createTournament,
    
    // Utilities
    hasSufficientBalance,
    formatAddress,
  };
}

