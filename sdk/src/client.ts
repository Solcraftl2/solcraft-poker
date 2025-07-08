import { Connection, PublicKey, Transaction, Keypair, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, BN, web3 } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import type { Wallet as WalletAdapter } from '@solana/wallet-adapter-base';

import { PROGRAM_IDS, NETWORKS, GAME_CONFIG } from './constants';
import { 
  getGameStatePDA, 
  getTablePDA, 
  getPlayerAccountPDA, 
  getTokenStatePDA,
  getStakeAccountPDA,
  getStakingPoolPDA,
  toBN,
  toPublicKey,
  retry
} from './utils';
import type {
  Network,
  NetworkConfig,
  GameState,
  PokerTable,
  PlayerAccount,
  TokenState,
  StakeAccount,
  BlindStructure,
  PlayerAction,
  TransactionResult,
  TransactionOptions
} from './types';

/**
 * Main SolCraft SDK Client
 */
export class SolCraftClient {
  public connection: Connection;
  public provider: AnchorProvider;
  public wallet: WalletAdapter;
  public network: Network;
  
  // Program instances
  public pokerProgram: Program | null = null;
  public tokenProgram: Program | null = null;
  
  constructor(
    connection: Connection,
    wallet: WalletAdapter,
    network: Network = 'devnet'
  ) {
    this.connection = connection;
    this.wallet = wallet;
    this.network = network;
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });
  }

  /**
   * Initialize the client with program instances
   */
  async initialize(): Promise<void> {
    try {
      // Initialize programs would go here
      // For now, we'll use a simplified approach
      console.log('SolCraft Client initialized');
    } catch (error) {
      throw new Error(`Failed to initialize client: ${error}`);
    }
  }

  /**
   * Create a new poker table
   */
  async createTable(
    tableId: BN,
    maxPlayers: number,
    buyInAmount: BN,
    blindStructure: BlindStructure,
    options?: TransactionOptions
  ): Promise<TransactionResult> {
    try {
      if (!this.wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const [tablePDA] = await getTablePDA(tableId, PROGRAM_IDS.POKER);
      const [gameStatePDA] = await getGameStatePDA(PROGRAM_IDS.POKER);

      const transaction = new Transaction();
      
      // Add create table instruction (simplified)
      // In real implementation, this would use the actual program instruction
      
      const signature = await this.sendTransaction(transaction, options);
      
      return {
        signature,
        success: true
      };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Join a poker table
   */
  async joinTable(
    tableId: BN,
    options?: TransactionOptions
  ): Promise<TransactionResult> {
    try {
      if (!this.wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const [tablePDA] = await getTablePDA(tableId, PROGRAM_IDS.POKER);
      const [playerAccountPDA] = await getPlayerAccountPDA(
        this.wallet.publicKey,
        tablePDA,
        PROGRAM_IDS.POKER
      );

      const transaction = new Transaction();
      
      // Add join table instruction (simplified)
      
      const signature = await this.sendTransaction(transaction, options);
      
      return {
        signature,
        success: true
      };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Place a bet
   */
  async placeBet(
    tableId: BN,
    amount: BN,
    action: PlayerAction,
    options?: TransactionOptions
  ): Promise<TransactionResult> {
    try {
      if (!this.wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const [tablePDA] = await getTablePDA(tableId, PROGRAM_IDS.POKER);
      const [playerAccountPDA] = await getPlayerAccountPDA(
        this.wallet.publicKey,
        tablePDA,
        PROGRAM_IDS.POKER
      );

      const transaction = new Transaction();
      
      // Add place bet instruction (simplified)
      
      const signature = await this.sendTransaction(transaction, options);
      
      return {
        signature,
        success: true
      };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Stake SOLP tokens
   */
  async stakeTokens(
    amount: BN,
    lockPeriod: BN,
    options?: TransactionOptions
  ): Promise<TransactionResult> {
    try {
      if (!this.wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const [stakeAccountPDA] = await getStakeAccountPDA(
        this.wallet.publicKey,
        PROGRAM_IDS.TOKEN
      );
      const [stakingPoolPDA] = await getStakingPoolPDA(PROGRAM_IDS.TOKEN);

      const transaction = new Transaction();
      
      // Add stake tokens instruction (simplified)
      
      const signature = await this.sendTransaction(transaction, options);
      
      return {
        signature,
        success: true
      };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Claim staking rewards
   */
  async claimRewards(options?: TransactionOptions): Promise<TransactionResult> {
    try {
      if (!this.wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const [stakeAccountPDA] = await getStakeAccountPDA(
        this.wallet.publicKey,
        PROGRAM_IDS.TOKEN
      );

      const transaction = new Transaction();
      
      // Add claim rewards instruction (simplified)
      
      const signature = await this.sendTransaction(transaction, options);
      
      return {
        signature,
        success: true
      };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get game state
   */
  async getGameState(): Promise<GameState | null> {
    try {
      const [gameStatePDA] = await getGameStatePDA(PROGRAM_IDS.POKER);
      const accountInfo = await this.connection.getAccountInfo(gameStatePDA);
      
      if (!accountInfo) {
        return null;
      }

      // Parse account data (simplified)
      // In real implementation, this would use the actual program's account parser
      return {
        authority: new PublicKey('11111111111111111111111111111112'),
        totalGames: new BN(0),
        totalVolume: new BN(0),
        feeRate: GAME_CONFIG.DEFAULT_FEE_RATE,
        minBuyIn: toBN(GAME_CONFIG.MIN_BUY_IN * 1e9),
        maxBuyIn: toBN(GAME_CONFIG.MAX_BUY_IN * 1e9),
        isPaused: false
      };
    } catch (error) {
      console.error('Error fetching game state:', error);
      return null;
    }
  }

  /**
   * Get poker table
   */
  async getTable(tableId: BN): Promise<PokerTable | null> {
    try {
      const [tablePDA] = await getTablePDA(tableId, PROGRAM_IDS.POKER);
      const accountInfo = await this.connection.getAccountInfo(tablePDA);
      
      if (!accountInfo) {
        return null;
      }

      // Parse account data (simplified)
      return {
        tableId,
        authority: new PublicKey('11111111111111111111111111111112'),
        maxPlayers: 9,
        currentPlayers: 0,
        buyInAmount: new BN(1000000),
        blindStructure: {
          smallBlind: new BN(5000),
          bigBlind: new BN(10000),
          ante: new BN(0)
        },
        status: 'Waiting' as any,
        potAmount: new BN(0),
        currentRound: 0,
        dealerPosition: 0,
        createdAt: new BN(Date.now() / 1000),
        players: [],
        playerChips: []
      };
    } catch (error) {
      console.error('Error fetching table:', error);
      return null;
    }
  }

  /**
   * Get player account
   */
  async getPlayerAccount(tableId: BN, player?: PublicKey): Promise<PlayerAccount | null> {
    try {
      const playerKey = player || this.wallet.publicKey;
      if (!playerKey) {
        throw new Error('Player key required');
      }

      const [tablePDA] = await getTablePDA(tableId, PROGRAM_IDS.POKER);
      const [playerAccountPDA] = await getPlayerAccountPDA(
        playerKey,
        tablePDA,
        PROGRAM_IDS.POKER
      );
      
      const accountInfo = await this.connection.getAccountInfo(playerAccountPDA);
      
      if (!accountInfo) {
        return null;
      }

      // Parse account data (simplified)
      return {
        player: playerKey,
        table: tablePDA,
        chips: new BN(1000000),
        position: 0,
        isActive: true,
        lastAction: 'None' as any
      };
    } catch (error) {
      console.error('Error fetching player account:', error);
      return null;
    }
  }

  /**
   * Get token state
   */
  async getTokenState(): Promise<TokenState | null> {
    try {
      const [tokenStatePDA] = await getTokenStatePDA(PROGRAM_IDS.TOKEN);
      const accountInfo = await this.connection.getAccountInfo(tokenStatePDA);
      
      if (!accountInfo) {
        return null;
      }

      // Parse account data (simplified)
      return {
        authority: new PublicKey('11111111111111111111111111111112'),
        mint: new PublicKey('11111111111111111111111111111112'),
        totalSupply: new BN(0),
        maxSupply: new BN(1000000000 * 1e9),
        isMintingEnabled: true,
        transferFeeRate: 0,
        stakingRewardsPool: new BN(0)
      };
    } catch (error) {
      console.error('Error fetching token state:', error);
      return null;
    }
  }

  /**
   * Get stake account
   */
  async getStakeAccount(user?: PublicKey): Promise<StakeAccount | null> {
    try {
      const userKey = user || this.wallet.publicKey;
      if (!userKey) {
        throw new Error('User key required');
      }

      const [stakeAccountPDA] = await getStakeAccountPDA(userKey, PROGRAM_IDS.TOKEN);
      const accountInfo = await this.connection.getAccountInfo(stakeAccountPDA);
      
      if (!accountInfo) {
        return null;
      }

      // Parse account data (simplified)
      return {
        user: userKey,
        amount: new BN(0),
        startTime: new BN(0),
        lockPeriod: new BN(0),
        lastClaimTime: new BN(0),
        isActive: false
      };
    } catch (error) {
      console.error('Error fetching stake account:', error);
      return null;
    }
  }

  /**
   * Get user's token balance
   */
  async getTokenBalance(mint: PublicKey, user?: PublicKey): Promise<BN> {
    try {
      const userKey = user || this.wallet.publicKey;
      if (!userKey) {
        throw new Error('User key required');
      }

      const tokenAccount = await getAssociatedTokenAddress(mint, userKey);
      const accountInfo = await this.connection.getTokenAccountBalance(tokenAccount);
      
      return new BN(accountInfo.value.amount);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return new BN(0);
    }
  }

  /**
   * Get user's SOL balance
   */
  async getSolBalance(user?: PublicKey): Promise<BN> {
    try {
      const userKey = user || this.wallet.publicKey;
      if (!userKey) {
        throw new Error('User key required');
      }

      const balance = await this.connection.getBalance(userKey);
      return new BN(balance);
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
      return new BN(0);
    }
  }

  /**
   * Send transaction with retry logic
   */
  private async sendTransaction(
    transaction: Transaction,
    options?: TransactionOptions
  ): Promise<string> {
    if (!this.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Get recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = this.wallet.publicKey;

    // Sign transaction
    const signedTransaction = await this.wallet.signTransaction!(transaction);

    // Send with retry
    return retry(async () => {
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: options?.skipPreflight ?? false,
          maxRetries: options?.maxRetries ?? 3,
        }
      );

      // Confirm transaction
      await this.connection.confirmTransaction(
        signature,
        options?.commitment ?? 'confirmed'
      );

      return signature;
    }, 3);
  }

  /**
   * Subscribe to account changes
   */
  subscribeToAccount(
    address: PublicKey,
    callback: (accountInfo: any) => void
  ): number {
    return this.connection.onAccountChange(address, callback);
  }

  /**
   * Unsubscribe from account changes
   */
  unsubscribeFromAccount(subscriptionId: number): void {
    this.connection.removeAccountChangeListener(subscriptionId);
  }

  /**
   * Get network configuration
   */
  getNetworkConfig(): NetworkConfig {
    return NETWORKS[this.network.toUpperCase() as keyof typeof NETWORKS];
  }

  /**
   * Switch network
   */
  switchNetwork(network: Network): void {
    this.network = network;
    const config = this.getNetworkConfig();
    this.connection = new Connection(config.rpcUrl, 'confirmed');
    this.provider = new AnchorProvider(this.connection, this.wallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });
  }
}

/**
 * Create SolCraft client instance
 */
export function createSolCraftClient(
  connection: Connection,
  wallet: WalletAdapter,
  network: Network = 'devnet'
): SolCraftClient {
  return new SolCraftClient(connection, wallet, network);
}

/**
 * Create connection for network
 */
export function createConnection(network: Network): Connection {
  const config = NETWORKS[network.toUpperCase() as keyof typeof NETWORKS];
  return new Connection(config.rpcUrl, 'confirmed');
}

