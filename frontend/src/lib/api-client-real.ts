/**
 * API Client per SolCraft Poker - Integrazione End-to-End Completa
 * Sostituisce completamente i mock data con API blockchain reali
 */

// Configuration from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');
const ENABLE_BLOCKCHAIN = process.env.NEXT_PUBLIC_ENABLE_BLOCKCHAIN === 'true';
const ENABLE_MOCK_DATA = process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true';
const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

// Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface WalletInfo {
  wallet: string;
  solp_balance: number;
  sol_balance: number;
  staked_amount: number;
  pending_rewards: number;
  last_updated: number;
}

export interface Tournament {
  tournament_id: number;
  organizer: string;
  name: string;
  buy_in: number;
  max_players: number;
  current_players: number;
  start_time: number;
  status: string;
  prize_pool: number;
  created_at: number;
}

export interface StakingPool {
  pool_id: number;
  creator: string;
  apy: number;
  lock_period: number;
  max_stake_amount: number;
  total_staked: number;
  active_stakers: number;
  pool_status: string;
  rewards_distributed: number;
  created_at: number;
}

export interface GovernanceProposal {
  proposal_id: number;
  proposer: string;
  title: string;
  description: string;
  votes_for: number;
  votes_against: number;
  status: string;
  created_at: number;
  voting_ends_at: number;
}

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

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private enableBlockchain: boolean;
  private enableMockData: boolean;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = API_TIMEOUT;
    this.enableBlockchain = ENABLE_BLOCKCHAIN;
    this.enableMockData = ENABLE_MOCK_DATA;

    if (DEBUG_MODE) {
      console.log('🔧 ApiClient initialized:', {
        baseURL: this.baseURL,
        enableBlockchain: this.enableBlockchain,
        enableMockData: this.enableMockData
      });
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      if (DEBUG_MODE) {
        console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (DEBUG_MODE) {
        console.log(`✅ API Response: ${url}`, data);
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (DEBUG_MODE) {
        console.error(`❌ API Error: ${endpoint}`, errorMessage);
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/health');
  }

  async blockchainHealth(): Promise<ApiResponse<any>> {
    return this.request('/api/blockchain/health');
  }

  // Wallet Operations
  async getWalletInfo(walletAddress: string): Promise<ApiResponse<WalletInfo>> {
    return this.request(`/api/blockchain/wallet/${walletAddress}`);
  }

  // Tournament Operations
  async getAllTournaments(): Promise<ApiResponse<{ tournaments: Tournament[]; count: number }>> {
    const response = await this.request<any>('/api/blockchain/tournaments');
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          tournaments: response.data.tournaments || [],
          count: response.data.count || 0
        }
      };
    }
    return response;
  }

  async getTournamentById(tournamentId: number): Promise<ApiResponse<Tournament>> {
    return this.request(`/api/blockchain/tournaments/${tournamentId}`);
  }

  async createTournament(tournamentData: {
    organizer_wallet: string;
    tournament_name: string;
    buy_in: number;
    max_players: number;
    start_time: number;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/blockchain/tournaments/create', {
      method: 'POST',
      body: JSON.stringify(tournamentData)
    });
  }

  async registerForTournament(
    tournamentId: number,
    playerWallet: string
  ): Promise<ApiResponse<any>> {
    return this.request(`/api/blockchain/tournaments/${tournamentId}/register`, {
      method: 'POST',
      body: JSON.stringify({
        player_wallet: playerWallet
      })
    });
  }

  // Staking Operations
  async getAllStakingPools(): Promise<ApiResponse<{ pools: StakingPool[]; count: number }>> {
    const response = await this.request<any>('/api/blockchain/staking/pools');
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          pools: response.data.pools || [],
          count: response.data.count || 0
        }
      };
    }
    return response;
  }

  async getStakingPoolById(poolId: number): Promise<ApiResponse<StakingPool>> {
    return this.request(`/api/blockchain/staking/pools/${poolId}`);
  }

  async stakeTokens(
    poolId: number,
    stakerWallet: string,
    amount: number
  ): Promise<ApiResponse<any>> {
    return this.request('/api/blockchain/staking/stake', {
      method: 'POST',
      body: JSON.stringify({
        pool_id: poolId,
        staker_wallet: stakerWallet,
        amount
      })
    });
  }

  async unstakeTokens(
    poolId: number,
    stakerWallet: string,
    amount: number
  ): Promise<ApiResponse<any>> {
    return this.request('/api/blockchain/staking/unstake', {
      method: 'POST',
      body: JSON.stringify({
        pool_id: poolId,
        staker_wallet: stakerWallet,
        amount
      })
    });
  }

  // Governance Operations
  async getAllProposals(): Promise<ApiResponse<{ proposals: GovernanceProposal[]; count: number }>> {
    const response = await this.request<any>('/api/blockchain/governance/proposals');
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          proposals: response.data.proposals || [],
          count: response.data.count || 0
        }
      };
    }
    return response;
  }

  async getProposalById(proposalId: number): Promise<ApiResponse<GovernanceProposal>> {
    return this.request(`/api/blockchain/governance/proposals/${proposalId}`);
  }

  async createProposal(proposalData: {
    proposer_wallet: string;
    title: string;
    description: string;
    voting_period_days?: number;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/blockchain/governance/proposals/create', {
      method: 'POST',
      body: JSON.stringify(proposalData)
    });
  }

  async voteOnProposal(
    proposalId: number,
    voterWallet: string,
    vote: boolean,
    votingPower?: number
  ): Promise<ApiResponse<any>> {
    return this.request(`/api/blockchain/governance/proposals/${proposalId}/vote`, {
      method: 'POST',
      body: JSON.stringify({
        voter_wallet: voterWallet,
        vote,
        voting_power: votingPower || 1
      })
    });
  }

  // Analytics
  async getPlatformAnalytics(): Promise<ApiResponse<PlatformAnalytics>> {
    return this.request('/api/blockchain/analytics/summary');
  }

  async getNetworkStats(): Promise<ApiResponse<any>> {
    return this.request('/api/blockchain/network-stats');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export default
export default apiClient;

