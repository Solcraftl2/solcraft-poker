// SolCraft SDK Integration for Frontend
import { Connection, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import type { WalletAdapter } from '@solana/wallet-adapter-base';

// Import SDK (in real implementation, this would be from npm package)
import { 
  SolCraftClient, 
  createSolCraftClient, 
  createConnection,
  NETWORKS,
  GAME_CONFIG,
  lamportsToSol,
  solToLamports,
  formatAddress,
  formatAmount
} from '../../../sdk/src';

import type {
  Network,
  GameState,
  PokerTable,
  PlayerAccount,
  TokenState,
  StakeAccount,
  BlindStructure,
  PlayerAction,
  TransactionResult
} from '../../../sdk/src/types';

/**
 * SolCraft SDK wrapper for React frontend
 */
export class SolCraftSDK {
  private client: SolCraftClient | null = null;
  private connection: Connection;
  private network: Network;

  constructor(network: Network = 'devnet') {
    this.network = network;
    this.connection = createConnection(network);
  }

  /**
   * Initialize SDK with wallet
   */
  async initialize(wallet: WalletAdapter): Promise<void> {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    this.client = createSolCraftClient(this.connection, wallet, this.network);
    await this.client.initialize();
  }

  /**
   * Get client instance
   */
  getClient(): SolCraftClient {
    if (!this.client) {
      throw new Error('SDK not initialized');
    }
    return this.client;
  }

  /**
   * Check if SDK is initialized
   */
  isInitialized(): boolean {
    return this.client !== null;
  }

  /**
   * Get network info
   */
  getNetworkInfo() {
    return {
      network: this.network,
      config: NETWORKS[this.network.toUpperCase() as keyof typeof NETWORKS],
      gameConfig: GAME_CONFIG
    };
  }

  /**
   * Switch network
   */
  async switchNetwork(network: Network): Promise<void> {
    this.network = network;
    this.connection = createConnection(network);
    
    if (this.client) {
      this.client.switchNetwork(network);
    }
  }

  // Game Methods
  /**
   * Create poker table
   */
  async createTable(params: {
    maxPlayers: number;
    buyInAmount: number; // in SOL
    smallBlind: number; // in SOL
    bigBlind: number; // in SOL
    ante?: number; // in SOL
  }): Promise<{ success: boolean; tableId?: string; error?: string }> {
    try {
      if (!this.client) throw new Error('SDK not initialized');

      const tableId = new BN(Math.floor(Math.random() * 1000000));
      const buyInLamports = solToLamports(params.buyInAmount);
      const blindStructure: BlindStructure = {
        smallBlind: solToLamports(params.smallBlind),
        bigBlind: solToLamports(params.bigBlind),
        ante: solToLamports(params.ante || 0)
      };

      const result = await this.client.createTable(
        tableId,
        params.maxPlayers,
        buyInLamports,
        blindStructure
      );

      return {
        success: result.success,
        tableId: result.success ? tableId.toString() : undefined,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Join poker table
   */
  async joinTable(tableId: string): Promise<TransactionResult> {
    if (!this.client) throw new Error('SDK not initialized');
    return this.client.joinTable(new BN(tableId));
  }

  /**
   * Place bet
   */
  async placeBet(
    tableId: string,
    amount: number, // in SOL
    action: PlayerAction
  ): Promise<TransactionResult> {
    if (!this.client) throw new Error('SDK not initialized');
    const amountLamports = solToLamports(amount);
    return this.client.placeBet(new BN(tableId), amountLamports, action);
  }

  /**
   * Get game state
   */
  async getGameState(): Promise<GameState | null> {
    if (!this.client) return null;
    return this.client.getGameState();
  }

  /**
   * Get table info
   */
  async getTable(tableId: string): Promise<PokerTable | null> {
    if (!this.client) return null;
    return this.client.getTable(new BN(tableId));
  }

  /**
   * Get player account
   */
  async getPlayerAccount(tableId: string, player?: PublicKey): Promise<PlayerAccount | null> {
    if (!this.client) return null;
    return this.client.getPlayerAccount(new BN(tableId), player);
  }

  // Token Methods
  /**
   * Stake tokens
   */
  async stakeTokens(
    amount: number, // in SOLP tokens
    lockDays: number
  ): Promise<TransactionResult> {
    if (!this.client) throw new Error('SDK not initialized');
    
    const amountTokens = new BN(amount * 1e9); // Convert to smallest unit
    const lockPeriod = new BN(lockDays * 24 * 3600); // Convert to seconds
    
    return this.client.stakeTokens(amountTokens, lockPeriod);
  }

  /**
   * Claim staking rewards
   */
  async claimRewards(): Promise<TransactionResult> {
    if (!this.client) throw new Error('SDK not initialized');
    return this.client.claimRewards();
  }

  /**
   * Get token state
   */
  async getTokenState(): Promise<TokenState | null> {
    if (!this.client) return null;
    return this.client.getTokenState();
  }

  /**
   * Get stake account
   */
  async getStakeAccount(user?: PublicKey): Promise<StakeAccount | null> {
    if (!this.client) return null;
    return this.client.getStakeAccount(user);
  }

  /**
   * Get token balance
   */
  async getTokenBalance(mint: PublicKey, user?: PublicKey): Promise<number> {
    if (!this.client) return 0;
    const balance = await this.client.getTokenBalance(mint, user);
    return balance.toNumber() / 1e9; // Convert to tokens
  }

  /**
   * Get SOL balance
   */
  async getSolBalance(user?: PublicKey): Promise<number> {
    if (!this.client) return 0;
    const balance = await this.client.getSolBalance(user);
    return lamportsToSol(balance);
  }

  // Utility Methods
  /**
   * Format address for display
   */
  formatAddress(address: string | PublicKey, chars: number = 4): string {
    return formatAddress(address, chars);
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number | BN, decimals: number = 9, precision: number = 4): string {
    return formatAmount(amount, decimals, precision);
  }

  /**
   * Convert SOL to lamports
   */
  solToLamports(sol: number): BN {
    return solToLamports(sol);
  }

  /**
   * Convert lamports to SOL
   */
  lamportsToSol(lamports: number | BN): number {
    return lamportsToSol(lamports);
  }

  /**
   * Subscribe to account changes
   */
  subscribeToAccount(
    address: PublicKey,
    callback: (accountInfo: any) => void
  ): number {
    if (!this.client) throw new Error('SDK not initialized');
    return this.client.subscribeToAccount(address, callback);
  }

  /**
   * Unsubscribe from account changes
   */
  unsubscribeFromAccount(subscriptionId: number): void {
    if (!this.client) throw new Error('SDK not initialized');
    this.client.unsubscribeFromAccount(subscriptionId);
  }
}

// Singleton instance
let sdkInstance: SolCraftSDK | null = null;

/**
 * Get SDK instance
 */
export function getSolCraftSDK(network: Network = 'devnet'): SolCraftSDK {
  if (!sdkInstance || sdkInstance.getNetworkInfo().network !== network) {
    sdkInstance = new SolCraftSDK(network);
  }
  return sdkInstance;
}

/**
 * Initialize SDK with wallet
 */
export async function initializeSolCraftSDK(
  wallet: WalletAdapter,
  network: Network = 'devnet'
): Promise<SolCraftSDK> {
  const sdk = getSolCraftSDK(network);
  await sdk.initialize(wallet);
  return sdk;
}

// Export types for use in components
export type {
  Network,
  GameState,
  PokerTable,
  PlayerAccount,
  TokenState,
  StakeAccount,
  BlindStructure,
  PlayerAction,
  TransactionResult
} from '../../../sdk/src/types';

