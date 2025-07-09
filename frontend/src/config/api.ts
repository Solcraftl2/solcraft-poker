/**
 * API Configuration for SolCraft Poker Frontend
 * Handles backend API endpoints and configuration
 */

// Backend API Base URL
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://8000-iqwvfv1l2oyek7vzk7aok-743bde84.manusvm.computer'
  : 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  // Health Check
  HEALTH: '/health',
  
  // User Management
  USERS: {
    REGISTER: '/api/users/register',
    PROFILE: (userId: string) => `/api/users/profile/${userId}`,
    BY_WALLET: (walletAddress: string) => `/api/users/wallet/${walletAddress}`,
    STATS: (userId: string) => `/api/users/${userId}/stats`,
  },
  
  // Tournament Management
  TOURNAMENTS: {
    LIST: '/api/tournaments/',
    CREATE: '/api/tournaments/create',
    GET: (tournamentId: string) => `/api/tournaments/${tournamentId}`,
    UPDATE: (tournamentId: string) => `/api/tournaments/${tournamentId}`,
    JOIN: (tournamentId: string) => `/api/tournaments/${tournamentId}/join`,
    START: (tournamentId: string) => `/api/tournaments/${tournamentId}/start`,
    LEADERBOARD: (tournamentId: string) => `/api/tournaments/${tournamentId}/leaderboard`,
  },
  
  // Blockchain Operations
  BLOCKCHAIN: {
    HEALTH: '/api/api/blockchain/health',
    NETWORK_STATS: '/api/api/blockchain/network-stats',
    WALLET_INFO: (walletAddress: string) => `/api/api/blockchain/wallet/${walletAddress}`,
    TOURNAMENTS: {
      CREATE: '/api/api/blockchain/tournaments/create',
      REGISTER: '/api/api/blockchain/tournaments/register',
      LIST: '/api/api/blockchain/tournaments',
      GET: (tournamentId: string) => `/api/api/blockchain/tournaments/${tournamentId}`,
    },
    STAKING: {
      POOLS: '/api/api/blockchain/staking/pools',
      CREATE_POOL: '/api/api/blockchain/staking/pools/create',
      STAKE: '/api/api/blockchain/staking/stake',
    },
    GOVERNANCE: {
      PROPOSALS: '/api/api/blockchain/governance/proposals',
      CREATE_PROPOSAL: '/api/api/blockchain/governance/proposals/create',
      VOTE: '/api/api/blockchain/governance/proposals/vote',
    },
    TOKENS: {
      TRANSFER: '/api/api/blockchain/tokens/transfer',
    },
    ANALYTICS: '/api/api/blockchain/analytics/summary',
  }
};

// API Client Configuration
export const API_CONFIG = {
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function for API calls
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = buildApiUrl(endpoint);
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

