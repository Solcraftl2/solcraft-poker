// Tipi aggiornati per SolCraft Poker - Integrazione Blockchain
import { LucideIcon } from 'lucide-react';

// ==================== WALLET & BLOCKCHAIN ====================

export interface WalletInfo {
  wallet: string;
  solp_balance: number;
  sol_balance: number;
  staked_amount: number;
  pending_rewards: number;
  last_updated: number;
}

export interface BlockchainTransaction {
  signature: string;
  timestamp: number;
  type: 'tournament_create' | 'tournament_register' | 'stake' | 'unstake' | 'vote' | 'transfer';
  amount?: number;
  status: 'pending' | 'confirmed' | 'failed';
}

// ==================== TOURNAMENTS ====================

export interface Tournament {
  id: string;
  name: string;
  buyIn: number;
  guaranteedPrizePool: number;
  startTime: string;
  status: 'Upcoming' | 'Live' | 'Completed' | 'Cancelled';
  participants: {
    current: number;
    max: number;
  };
  imageUrl: string;
  description: string;
  platform: string;
  averagePlayers: number;
  historicalData: string;
  raisedAmount: number;
  aiRiskAssessment: {
    riskLevel: 'Low' | 'Medium' | 'High';
    riskFactors: string[];
    investmentRecommendation: string;
    potentialReturn: string;
  };
  tokenizationDetails: TournamentTokenizationDetails;
  isCompleted: boolean;
  // Blockchain specific fields
  organizer?: string;
  transaction_signature?: string;
  blockchain_id?: number;
}

export interface TournamentTokenizationDetails {
  isTokenized: boolean;
  tokenTicker: string;
  tokenPrice: number;
  totalTokenSupply: number;
  minInvestmentTokens: number;
  maxInvestmentTokens: number;
}

// ==================== STAKING ====================

export interface StakingPool {
  id: string;
  name: string;
  apy: number;
  totalStaked: number;
  lockPeriod: number; // in days
  maxStakeAmount: number;
  activeStakers: number;
  status: 'active' | 'paused' | 'closed';
  rewardsDistributed: number;
  createdAt: string;
  // Blockchain specific
  creator?: string;
  blockchain_id?: number;
}

export interface StakingSummary {
  totalStaked: number;
  totalRewards: number;
  activeStakes: number;
  averageAPY: number;
}

export interface UserStake {
  poolId: string;
  amount: number;
  stakedAt: string;
  unlockAt: string;
  rewardsEarned: number;
  status: 'active' | 'unlocked' | 'withdrawn';
}

// ==================== GOVERNANCE ====================

export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  votesFor: number;
  votesAgainst: number;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  createdAt: string;
  votingEndsAt: string;
  totalVotes: number;
  // Blockchain specific
  blockchain_id?: number;
  quorum_required?: number;
}

export interface UserVote {
  proposalId: string;
  vote: boolean; // true = for, false = against
  votingPower: number;
  timestamp: string;
}

// ==================== USER & PROFILE ====================

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  walletAddress?: string;
  totalInvested?: number;
  overallReturn?: number;
  currentInvestmentTierName?: string;
  joinedAt: string;
  lastActive: string;
  // Blockchain stats
  totalStaked?: number;
  governanceVotes?: number;
  tournamentsPlayed?: number;
}

export interface Investment {
  id: string;
  tournamentId: string;
  investorId: string;
  amount: number;
  percentage: number;
  status: 'Active' | 'Completed' | 'Cancelled';
  investedAt: string;
  expectedReturn?: number;
  actualReturn?: number;
}

// ==================== UI COMPONENTS ====================

export interface KeyMetric {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  valueClassName?: string;
}

export interface RecentActivity {
  id: string;
  type: 'investment' | 'tournament' | 'staking' | 'governance';
  description: string;
  amount?: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  transactionHash?: string;
}

export interface PortfolioData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

export interface PortfolioAllocationItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}

// ==================== PLATFORM STATE ====================

export interface PoolState {
  totalValueLocked: number;
  totalUsers: number;
  totalRewards: number;
  averageAPY: number;
}

export interface TournamentAllocation {
  tournamentName: string;
  allocation: number;
  color: string;
}

export interface PlayerDeposit {
  playerName: string;
  amount: number;
  timestamp: string;
}

export interface SubPoolState {
  name: string;
  tvl: number;
  apy: number;
  participants: number;
}

// ==================== TOKEN LAUNCH ====================

export interface TokenLaunch {
  id: string;
  name: string;
  symbol: string;
  description: string;
  totalSupply: number;
  initialPrice: number;
  launchDate: string;
  status: 'upcoming' | 'live' | 'completed';
  raisedAmount: number;
  targetAmount: number;
  participants: number;
}

// ==================== ENUMS ====================

export enum PlayerRank {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER', 
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}

export enum InvestmentTier {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  PLATINUM = 'Platinum'
}

// ==================== INVESTMENT TIERS ====================

export interface InvestmentTier {
  name: string;
  minInvestment: number;
  maxInvestment: number;
  feeReduction: number;
  priorityAccess: boolean;
  icon: LucideIcon;
  color: string;
  benefits: string[];
}

// ==================== SOCIAL FEATURES ====================

export interface SocialPlayer {
  id: string;
  name: string;
  avatar: string;
  rank: PlayerRank;
  totalWinnings: number;
  winRate: number;
  followers: number;
  isFollowing: boolean;
}

// ==================== ROADMAP ====================

export interface RoadmapItemProps {
  quarter: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  features: string[];
}

// ==================== API RESPONSES ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ==================== BLOCKCHAIN EVENTS ====================

export interface BlockchainEvent {
  id: string;
  type: 'tournament_created' | 'player_registered' | 'stake_added' | 'proposal_created' | 'vote_cast';
  data: any;
  timestamp: string;
  blockNumber?: number;
  transactionHash?: string;
}

// ==================== ANALYTICS ====================

export interface PlatformAnalytics {
  tournaments: {
    total: number;
    active: number;
    total_prize_pool: number;
  };
  staking: {
    total_pools: number;
    total_staked: number;
    active_stakers: number;
  };
  governance: {
    total_proposals: number;
    active_proposals: number;
  };
  last_updated: number;
}

// ==================== ERROR HANDLING ====================

export interface ErrorState {
  hasError: boolean;
  message: string;
  code?: string;
  timestamp: string;
}

// ==================== LOADING STATES ====================

export interface LoadingState {
  isLoading: boolean;
  operation?: string;
  progress?: number;
}

// ==================== FORM TYPES ====================

export interface TournamentCreateForm {
  name: string;
  description: string;
  buyIn: number;
  maxPlayers: number;
  startTime: string;
  prizeStructure: number[];
}

export interface StakingForm {
  poolId: string;
  amount: number;
  lockPeriod: number;
}

export interface GovernanceForm {
  title: string;
  description: string;
  votingPeriod: number;
  proposalType: 'general' | 'parameter_change' | 'treasury_spend';
}

// ==================== NOTIFICATION TYPES ====================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Export all types for easy importing
export type {
  Tournament,
  StakingPool,
  GovernanceProposal,
  UserProfile,
  Investment,
  KeyMetric,
  RecentActivity,
  PortfolioData,
  PortfolioAllocationItem,
  Cryptocurrency,
  PoolState,
  TournamentAllocation,
  PlayerDeposit,
  SubPoolState,
  TokenLaunch,
  InvestmentTier,
  SocialPlayer,
  RoadmapItemProps,
  WalletInfo,
  BlockchainTransaction,
  UserStake,
  UserVote,
  BlockchainEvent,
  PlatformAnalytics,
  ErrorState,
  LoadingState,
  TournamentCreateForm,
  StakingForm,
  GovernanceForm,
  Notification
};

