/**
 * API Client per SolCraft Poker - Integrazione Backend Blockchain
 * Implementato con PyCharm Professional per massima qualità
 */

import { Tournament, StakingPool, GovernanceProposal, WalletInfo } from './types';

// Configurazione API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const BLOCKCHAIN_API_BASE = `${API_BASE_URL}/api/blockchain`;

// Tipi per richieste API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface TournamentCreateRequest {
  organizer_wallet: string;
  buy_in: number;
  max_players: number;
  tournament_name: string;
  start_time: number;
}

interface TournamentRegistrationRequest {
  tournament_id: number;
  player_wallet: string;
}

interface StakingPoolCreateRequest {
  creator_wallet: string;
  apy: number;
  lock_period_days: number;
  max_stake_amount: number;
}

interface StakeTokensRequest {
  pool_id: number;
  staker_wallet: string;
  amount: number;
}

interface GovernanceProposalRequest {
  proposer_wallet: string;
  title: string;
  description: string;
  voting_period_days?: number;
}

interface VoteRequest {
  proposal_id: number;
  voter_wallet: string;
  vote: boolean;
  voting_power?: number;
}

interface TokenTransferRequest {
  from_wallet: string;
  to_wallet: string;
  amount: number;
}

// Utility per gestione errori
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Client HTTP base
class HttpClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BLOCKCHAIN_API_BASE}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      console.error('API request failed:', error);
      throw new ApiError(0, 'Network error or server unavailable');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Client API principale
export class SolCraftApiClient {
  private http = new HttpClient();

  // ==================== HEALTH & STATUS ====================

  async getHealthStatus(): Promise<any> {
    return this.http.get('/health');
  }

  async getNetworkStats(): Promise<any> {
    return this.http.get('/network-stats');
  }

  // ==================== WALLET MANAGEMENT ====================

  async getWalletInfo(walletAddress: string): Promise<WalletInfo> {
    const response = await this.http.get<ApiResponse<WalletInfo>>(`/wallet/${walletAddress}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get wallet info');
    }
    
    return response.data;
  }

  // ==================== TOURNAMENTS ====================

  async createTournament(request: TournamentCreateRequest): Promise<any> {
    return this.http.post('/tournaments/create', request);
  }

  async registerForTournament(request: TournamentRegistrationRequest): Promise<any> {
    return this.http.post('/tournaments/register', request);
  }

  async getAllTournaments(): Promise<Tournament[]> {
    const response = await this.http.get<{
      success: boolean;
      tournaments: any[];
      count: number;
    }>('/tournaments');
    
    if (!response.success) {
      throw new Error('Failed to get tournaments');
    }
    
    // Trasforma dati blockchain in formato frontend
    return response.tournaments.map(this.transformTournamentData);
  }

  async getTournamentById(tournamentId: number): Promise<Tournament> {
    const response = await this.http.get<{
      success: boolean;
      tournament: any;
    }>(`/tournaments/${tournamentId}`);
    
    if (!response.success || !response.tournament) {
      throw new Error('Tournament not found');
    }
    
    return this.transformTournamentData(response.tournament);
  }

  private transformTournamentData(blockchainData: any): Tournament {
    return {
      id: blockchainData.tournament_id.toString(),
      name: blockchainData.name || 'Unnamed Tournament',
      buyIn: blockchainData.buy_in,
      guaranteedPrizePool: blockchainData.prize_pool,
      startTime: new Date(blockchainData.start_time * 1000).toISOString(),
      status: this.mapTournamentStatus(blockchainData.status),
      participants: {
        current: blockchainData.current_players,
        max: blockchainData.max_players
      },
      imageUrl: 'https://placehold.co/600x400.png', // Default image
      description: `Tournament organized by ${blockchainData.organizer}`,
      platform: 'SolCraft Poker',
      averagePlayers: blockchainData.max_players * 0.75, // Estimate
      historicalData: 'Real tournament data from blockchain',
      raisedAmount: blockchainData.prize_pool,
      aiRiskAssessment: {
        riskLevel: 'Medium',
        riskFactors: ['Blockchain-based tournament'],
        investmentRecommendation: 'Consider based on your risk tolerance',
        potentialReturn: 'Variable based on performance'
      },
      tokenizationDetails: {
        isTokenized: true,
        tokenTicker: 'SOLP',
        tokenPrice: 1,
        totalTokenSupply: blockchainData.buy_in,
        minInvestmentTokens: 1,
        maxInvestmentTokens: blockchainData.buy_in
      },
      isCompleted: blockchainData.status === 'completed_won' || blockchainData.status === 'completed_lost'
    };
  }

  private mapTournamentStatus(blockchainStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'created': 'Upcoming',
      'registration_open': 'Upcoming',
      'funding_open': 'Upcoming',
      'funding_complete': 'Live',
      'in_progress': 'Live',
      'completed_won': 'Completed',
      'completed_lost': 'Completed',
      'cancelled': 'Cancelled'
    };
    
    return statusMap[blockchainStatus] || 'Unknown';
  }

  // ==================== STAKING ====================

  async createStakingPool(request: StakingPoolCreateRequest): Promise<any> {
    return this.http.post('/staking/pools/create', request);
  }

  async stakeTokens(request: StakeTokensRequest): Promise<any> {
    return this.http.post('/staking/stake', request);
  }

  async getAllStakingPools(): Promise<StakingPool[]> {
    const response = await this.http.get<{
      success: boolean;
      pools: any[];
      count: number;
    }>('/staking/pools');
    
    if (!response.success) {
      throw new Error('Failed to get staking pools');
    }
    
    return response.pools.map(this.transformStakingPoolData);
  }

  async getStakingPoolById(poolId: number): Promise<StakingPool> {
    const response = await this.http.get<{
      success: boolean;
      pool: any;
    }>(`/staking/pools/${poolId}`);
    
    if (!response.success || !response.pool) {
      throw new Error('Staking pool not found');
    }
    
    return this.transformStakingPoolData(response.pool);
  }

  private transformStakingPoolData(blockchainData: any): StakingPool {
    return {
      id: blockchainData.pool_id.toString(),
      name: `Staking Pool ${blockchainData.pool_id}`,
      apy: blockchainData.apy,
      totalStaked: blockchainData.total_staked,
      lockPeriod: blockchainData.lock_period,
      maxStakeAmount: blockchainData.max_stake_amount,
      activeStakers: blockchainData.active_stakers,
      status: blockchainData.pool_status,
      rewardsDistributed: blockchainData.rewards_distributed,
      createdAt: new Date(blockchainData.created_at * 1000).toISOString()
    };
  }

  // ==================== GOVERNANCE ====================

  async createProposal(request: GovernanceProposalRequest): Promise<any> {
    return this.http.post('/governance/proposals/create', request);
  }

  async voteOnProposal(request: VoteRequest): Promise<any> {
    return this.http.post('/governance/proposals/vote', request);
  }

  async getAllProposals(): Promise<GovernanceProposal[]> {
    const response = await this.http.get<{
      success: boolean;
      proposals: any[];
      count: number;
    }>('/governance/proposals');
    
    if (!response.success) {
      throw new Error('Failed to get proposals');
    }
    
    return response.proposals.map(this.transformProposalData);
  }

  async getProposalById(proposalId: number): Promise<GovernanceProposal> {
    const response = await this.http.get<{
      success: boolean;
      proposal: any;
    }>(`/governance/proposals/${proposalId}`);
    
    if (!response.success || !response.proposal) {
      throw new Error('Proposal not found');
    }
    
    return this.transformProposalData(response.proposal);
  }

  private transformProposalData(blockchainData: any): GovernanceProposal {
    return {
      id: blockchainData.proposal_id.toString(),
      title: blockchainData.title,
      description: blockchainData.description,
      proposer: blockchainData.proposer,
      votesFor: blockchainData.votes_for,
      votesAgainst: blockchainData.votes_against,
      status: blockchainData.status,
      createdAt: new Date(blockchainData.created_at * 1000).toISOString(),
      votingEndsAt: new Date(blockchainData.voting_ends_at * 1000).toISOString(),
      totalVotes: blockchainData.votes_for + blockchainData.votes_against
    };
  }

  // ==================== TOKEN OPERATIONS ====================

  async transferTokens(request: TokenTransferRequest): Promise<any> {
    return this.http.post('/tokens/transfer', request);
  }

  // ==================== ANALYTICS ====================

  async getPlatformAnalytics(): Promise<any> {
    return this.http.get('/analytics/summary');
  }

  // ==================== CACHE MANAGEMENT ====================

  async clearCache(): Promise<any> {
    return this.http.post('/cache/clear');
  }
}

// Istanza singleton del client API
export const apiClient = new SolCraftApiClient();

// Hook personalizzati per React
export const useApiClient = () => {
  return apiClient;
};

// Utility per gestione errori nelle componenti
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Tipi esportati per uso nelle componenti
export type {
  TournamentCreateRequest,
  TournamentRegistrationRequest,
  StakingPoolCreateRequest,
  StakeTokensRequest,
  GovernanceProposalRequest,
  VoteRequest,
  TokenTransferRequest,
  ApiResponse
};

export { ApiError };

