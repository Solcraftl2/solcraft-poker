import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

// Network types
export type Network = 'mainnet-beta' | 'devnet' | 'testnet' | 'localhost';

export interface NetworkConfig {
  name: Network;
  rpcUrl: string;
  wsUrl: string;
}

// Wallet types
export interface WalletInfo {
  name: string;
  icon: string;
  url: string;
  adapter?: any;
}

// Game types
export interface GameState {
  authority: PublicKey;
  totalGames: BN;
  totalVolume: BN;
  feeRate: number;
  minBuyIn: BN;
  maxBuyIn: BN;
  isPaused: boolean;
}

export interface PokerTable {
  tableId: BN;
  authority: PublicKey;
  maxPlayers: number;
  currentPlayers: number;
  buyInAmount: BN;
  blindStructure: BlindStructure;
  status: TableStatus;
  potAmount: BN;
  currentRound: number;
  dealerPosition: number;
  createdAt: BN;
  players: PublicKey[];
  playerChips: BN[];
}

export interface PlayerAccount {
  player: PublicKey;
  table: PublicKey;
  chips: BN;
  position: number;
  isActive: boolean;
  lastAction: PlayerAction;
}

export interface BlindStructure {
  smallBlind: BN;
  bigBlind: BN;
  ante: BN;
}

export enum TableStatus {
  Waiting = 'Waiting',
  Playing = 'Playing',
  Finished = 'Finished',
}

export enum PlayerAction {
  None = 'None',
  Fold = 'Fold',
  Check = 'Check',
  Call = 'Call',
  Bet = 'Bet',
  Raise = 'Raise',
  AllIn = 'AllIn',
}

// Token types
export interface TokenState {
  authority: PublicKey;
  mint: PublicKey;
  totalSupply: BN;
  maxSupply: BN;
  isMintingEnabled: boolean;
  transferFeeRate: number;
  stakingRewardsPool: BN;
}

export interface StakeAccount {
  user: PublicKey;
  amount: BN;
  startTime: BN;
  lockPeriod: BN;
  lastClaimTime: BN;
  isActive: boolean;
}

// Tournament types
export interface Tournament {
  id: BN;
  name: string;
  buyIn: BN;
  maxPlayers: number;
  currentPlayers: number;
  prizePool: BN;
  status: TournamentStatus;
  startTime: BN;
  endTime: BN;
  creator: PublicKey;
  winners: PublicKey[];
  payouts: BN[];
}

export enum TournamentStatus {
  Registration = 'Registration',
  Running = 'Running',
  Finished = 'Finished',
  Cancelled = 'Cancelled',
}

// Escrow types
export interface EscrowAccount {
  authority: PublicKey;
  depositor: PublicKey;
  beneficiary: PublicKey;
  mint: PublicKey;
  amount: BN;
  releaseTime: BN;
  isReleased: boolean;
  conditions: EscrowCondition[];
}

export interface EscrowCondition {
  conditionType: ConditionType;
  value: string;
  isMet: boolean;
}

export enum ConditionType {
  TimeDelay = 'TimeDelay',
  MultiSig = 'MultiSig',
  Oracle = 'Oracle',
  GameResult = 'GameResult',
}

// Governance types
export interface Proposal {
  id: BN;
  proposer: PublicKey;
  title: string;
  description: string;
  proposalType: ProposalType;
  votingStart: BN;
  votingEnd: BN;
  yesVotes: BN;
  noVotes: BN;
  status: ProposalStatus;
  executionTime: BN;
  parameters: ProposalParameters;
}

export enum ProposalType {
  ParameterChange = 'ParameterChange',
  Treasury = 'Treasury',
  Upgrade = 'Upgrade',
  Emergency = 'Emergency',
}

export enum ProposalStatus {
  Active = 'Active',
  Succeeded = 'Succeeded',
  Defeated = 'Defeated',
  Executed = 'Executed',
  Cancelled = 'Cancelled',
}

export interface ProposalParameters {
  [key: string]: any;
}

export interface Vote {
  voter: PublicKey;
  proposal: PublicKey;
  side: VoteSide;
  weight: BN;
  timestamp: BN;
}

export enum VoteSide {
  Yes = 'Yes',
  No = 'No',
  Abstain = 'Abstain',
}

// Transaction types
export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

export interface TransactionOptions {
  skipPreflight?: boolean;
  commitment?: 'processed' | 'confirmed' | 'finalized';
  maxRetries?: number;
}

// API types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Event types
export interface GameEvent {
  type: GameEventType;
  tableId: string;
  playerId?: string;
  data: any;
  timestamp: number;
}

export enum GameEventType {
  PlayerJoined = 'PlayerJoined',
  PlayerLeft = 'PlayerLeft',
  GameStarted = 'GameStarted',
  GameEnded = 'GameEnded',
  BetPlaced = 'BetPlaced',
  CardsDealt = 'CardsDealt',
  PotWon = 'PotWon',
}

// Utility types
export type Address = string | PublicKey;
export type Amount = number | string | BN;

export interface ProgramAccount<T> {
  publicKey: PublicKey;
  account: T;
}

export interface AccountInfo<T> {
  data: T;
  executable: boolean;
  lamports: number;
  owner: PublicKey;
  rentEpoch: number;
}

