import { PublicKey } from '@solana/web3.js';

// Program IDs
export const PROGRAM_IDS = {
  POKER: new PublicKey('SoLCraftPoker11111111111111111111111111111'),
  TOKEN: new PublicKey('SoLCraftToken1111111111111111111111111111'),
  ESCROW: new PublicKey('SoLCraftEscrow111111111111111111111111111'),
  GOVERNANCE: new PublicKey('SoLCraftGov1111111111111111111111111111111'),
  STAKING: new PublicKey('SoLCraftStaking11111111111111111111111111'),
  TOURNAMENTS: new PublicKey('SoLCraftTournament1111111111111111111111111'),
} as const;

// Network configurations
export const NETWORKS = {
  MAINNET: {
    name: 'mainnet-beta',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    wsUrl: 'wss://api.mainnet-beta.solana.com',
  },
  DEVNET: {
    name: 'devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    wsUrl: 'wss://api.devnet.solana.com',
  },
  TESTNET: {
    name: 'testnet',
    rpcUrl: 'https://api.testnet.solana.com',
    wsUrl: 'wss://api.testnet.solana.com',
  },
  LOCALHOST: {
    name: 'localhost',
    rpcUrl: 'http://127.0.0.1:8899',
    wsUrl: 'ws://127.0.0.1:8900',
  },
} as const;

// Token constants
export const TOKEN_CONFIG = {
  SOLP: {
    name: 'SolCraft Poker Token',
    symbol: 'SOLP',
    decimals: 9,
    maxSupply: 1_000_000_000, // 1 billion tokens
  },
} as const;

// Game constants
export const GAME_CONFIG = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 9,
  MIN_BUY_IN: 0.001, // SOL
  MAX_BUY_IN: 1.0, // SOL
  DEFAULT_FEE_RATE: 250, // 2.5% in basis points
  MIN_STAKE_PERIOD: 7 * 24 * 3600, // 7 days in seconds
} as const;

// Seed constants for PDAs
export const SEEDS = {
  GAME_STATE: 'game_state',
  TABLE: 'table',
  PLAYER: 'player',
  TOKEN_STATE: 'token_state',
  STAKE: 'stake',
  STAKING_POOL: 'staking_pool',
  ESCROW: 'escrow',
  TOURNAMENT: 'tournament',
  GOVERNANCE: 'governance',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Wallet not connected',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INVALID_AMOUNT: 'Invalid amount',
  TRANSACTION_FAILED: 'Transaction failed',
  PROGRAM_NOT_FOUND: 'Program not found',
  ACCOUNT_NOT_FOUND: 'Account not found',
} as const;

