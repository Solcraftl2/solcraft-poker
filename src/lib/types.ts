
import type { TournamentRiskAssessmentOutput } from '@/ai/flows/tournament-risk-assessment';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export interface TournamentTokenizationDetails {
  isTokenized: boolean;
  tokenTicker: string; // e.g., "TRNT"
  tokenPrice: number; // e.g., 1 (representing $1 per token)
  totalTokenSupply: number; // Derived from buyInAmount / tokenPrice
  minInvestmentTokens: number;
  maxInvestmentTokens: number; // Could be equal to totalTokenSupply for full backing
}

export interface Tournament {
  id: string;
  name: string;
  buyIn: number;
  guaranteedPrizePool: number;
  startTime: string; // ISO string
  status: 'Upcoming' | 'Live' | 'Finished';
  participants?: {
    current: number;
    max?: number;
  };
  imageUrl?: string;
  description?: string;
  platform?: string; // e.g., "PokerStars", "Online", "Live Event"
  averagePlayers?: number; // For AI input
  historicalData?: string; // For AI input, can be a longer text
  aiRiskAssessment?: TournamentRiskAssessmentOutput; // Store pre-computed or on-demand
  tokenizationDetails?: TournamentTokenizationDetails;
  prizeWon?: number;
  isCompleted?: boolean;
  raisedAmount?: number;
}

export interface InvestmentTier {
  id: string;
  name: string;
  minInvestmentCurrency: number;
  maxInvestmentCurrency?: number;
  minInvestmentTokens: number;
  maxInvestmentTokens?: number;
  platformFeePercentage: number; // e.g., 5 for 5%
  priorityDescription?: string;
  potentialReturn: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  description: string;
  benefits: string[];
}

export interface UserProfile {
  id:string;
  uid: string;
  email: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  joinedDate: string; // ISO string
  followersCount: number;
  followingCount: number;
  totalInvested: number;
  overallReturn: number; // percentage or absolute
  ranking?: number | null;
  isWalletConnected?: boolean;
  walletAddress?: string;
  balance?: {
    amount: number;
    currency: string;
  };
  currentInvestmentTierName?: string;
  notificationSettings?: {
    investmentUpdates: boolean;
    newTournaments: boolean;
    socialActivity: boolean;
    platformNews: boolean;
  };
  referralCode?: string;
}

export interface Investment {
  id: string;
  investorId: string;
  tournamentId: string;
  tournamentName: string;
  tierName?: string; // Could be the name of the tier like "Gold Access"
  investmentValueUSD: number;
  tokenAmount: number;
  investmentDate: string; // ISO string
  status: 'Active' | 'Cashed Out' | 'Lost' | 'Pending';
  currentValue?: number;
  returnOnInvestment?: number;
}

export interface PortfolioData {
  totalValue: number;
  totalInvested: number;
  overallReturn: number; // percentage
  bestPerformingInvestment?: Investment;
  worstPerformingInvestment?: Investment;
}

export interface SocialPlayer extends UserProfile {
  recentPerformance: string;
  isFollowed?: boolean;
}

export interface PortfolioAllocationItem {
  name: string;
  value: number;
  color: string;
}

export interface KeyMetric {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  valueClassName?: string;
}

export interface Cryptocurrency {
  id: string;
  rank: number;
  name: string;
  ticker: string;
  iconUrl?: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export interface RecentActivity {
  id: string;
  type: 'Swap' | 'Deposit' | 'Withdrawal' | 'Investment' | 'Payout';
  date: string;
  time: string;
  tokenAmount: string;
  status: 'Completed' | 'In Progress' | 'Failed' | 'Pending';
  viewLink?: string;
}

export interface RoadmapItemProps {
  quarter: string;
  year: string;
  milestones: string[];
  isOffset?: boolean;
  isLast?: boolean;
}

// Types from pool-architecture.md

// ---- Tournament Investment Pool Types ----
export interface PoolState {
  totalDeposits: number;
  activeTournamentsFunded: number; // Number of tournaments currently being funded
  availableLiquidity: number;
  pendingWithdrawals: number;
  totalReturnsGenerated: number; // From completed tournaments
}

export interface TournamentAllocation {
  id: string; // Unique ID for this allocation instance
  tournamentId: string; // Refers to Tournament.id
  tournamentName: string; // For display convenience
  allocatedAmount: number;
  status: 'Funding' | 'Active' | 'Completed' | 'Cancelled' | 'Refunding';
  expectedReturnRate?: number; // Percentage
  actualReturnAmount?: number;
  numberOfInvestors?: number; // Number of distinct investors in this allocation
}

// ---- Player Deposit Pool Types ----
export enum PlayerRank {
  PLATINUM = "Platinum",
  GOLD = "Gold",
  SILVER = "Silver",
  BRONZE = "Bronze",
  UNVERIFIED = "Unverified",
}

export interface SubPoolState {
  rankCategory: PlayerRank;
  totalDeposits: number;
  totalLockedFunds: number;
  availableForWithdrawal: number;
  totalPenaltyFundsCollected: number;
  numberOfPlayers: number;
}

export interface PlayerDeposit {
  id: string; // Unique ID for this deposit
  playerId: string; // Refers to UserProfile.uid
  playerName?: string; // For display convenience
  playerRank: PlayerRank;
  depositAmount: number;
  currency: string; // e.g., 'USD', 'SOL'
  tournamentId?: string; // Optional, if a deposit is for a specific tournament
  status: 'Pending' | 'Locked' | 'PartiallyRefunded' | 'FullyRefunded' | 'Penalized' | 'ForfeitedToCompensation';
  depositDate: string; // ISO string
  resolutionDate?: string; // ISO string, when the deposit status was finalized
  notes?: string;
}

// ---- Launchtoken Page Types ----
export interface TokenLaunch {
  id: string;
  name: string;
  ticker: string;
  logoUrl: string;
  description: string;
  stage: 'Upcoming' | 'Live' | 'Ended' | 'TBA'; // TBA: To Be Announced
  targetRaise: number; // In currency
  raisedAmount: number; // In currency
  tokenPrice: number; // Price per token in currency
  currency: string; // e.g., USDC, SOL
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  projectWebsite?: string;
  whitepaperLink?: string;
  detailsLink: string; // Link to a detailed page for this launch within SolCraft
  category?: string; // e.g., DeFi, GameFi, Infra, Meme
  isFeatured?: boolean;
  tags?: string[]; // e.g., ["AI", "Layer 2", "Gaming"]
  vestingSchedule?: string; // "10% TGE, 6 month linear"
  totalSupply?: number;
  circulatingSupplyOnLaunch?: number;
}

// ---- Staking Page Types ----
export interface StakingSummary {
  totalStakedUSD: number;
  totalRewardsEarnedUSD: number;
  averageAPY: number; // percentage
  activeStakesCount: number;
}

export interface StakingPool {
  id: string;
  assetName: string;
  assetTicker: string;
  assetLogoUrl: string;
  apy: number; // percentage, could be a range string like "5-7%" or a number
  lockUpPeriod: string; // e.g., "Flexible", "30 Days", "90 Days", "1 Year"
  minStake?: number; // in asset's own unit (e.g, 100 SOL)
  maxStake?: number; // in asset's own unit
  totalStakedInPoolUSD: number; // Total value staked by all users in this pool
  userStakedAmount?: number; // Amount user has staked in this pool (in asset's unit)
  userRewardsEarned?: number; // Rewards user earned from this pool (in asset's unit)
  platform: string; // e.g., SolCraft Native, Lido, Marinade
  riskLevel: 'Low' | 'Medium' | 'High';
  detailsLink: string; // Link to a detailed page for this staking option
  type: 'Native' | 'Liquid' | 'LP Farming'; // Staking type
  isFeatured?: boolean;
  availableToStake: boolean; // Is the pool currently open for new stakes
}

export interface SupportTicket {
    id?: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string; // ISO String
    status: 'open' | 'closed';
    userId?: string;
}
