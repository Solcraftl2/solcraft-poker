/**
 * Hook React per gestione dati blockchain SolCraft
 * Sostituisce completamente i mock data con dati reali
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, handleApiError } from '@/lib/api-client';
import type {
  Tournament,
  StakingPool,
  GovernanceProposal,
  WalletInfo,
  PlatformAnalytics,
  RecentActivity,
  KeyMetric,
  LoadingState,
  ErrorState
} from '@/lib/types';

// ==================== TOURNAMENTS HOOK ====================

export const useTournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: true });
  const [error, setError] = useState<ErrorState>({ hasError: false, message: '', timestamp: '' });

  const fetchTournaments = useCallback(async () => {
    try {
      setLoading({ isLoading: true, operation: 'Fetching tournaments' });
      setError({ hasError: false, message: '', timestamp: '' });
      
      const data = await apiClient.getAllTournaments();
      setTournaments(data);
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError({
        hasError: true,
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      console.error('Error fetching tournaments:', err);
    } finally {
      setLoading({ isLoading: false });
    }
  }, []);

  const createTournament = useCallback(async (tournamentData: {
    organizer_wallet: string;
    buy_in: number;
    max_players: number;
    tournament_name: string;
    start_time: number;
  }) => {
    try {
      setLoading({ isLoading: true, operation: 'Creating tournament' });
      
      const result = await apiClient.createTournament(tournamentData);
      
      if (result.success) {
        // Refresh tournaments list
        await fetchTournaments();
        return result;
      } else {
        throw new Error(result.error || 'Failed to create tournament');
      }
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError({
        hasError: true,
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setLoading({ isLoading: false });
    }
  }, [fetchTournaments]);

  const registerForTournament = useCallback(async (tournamentId: number, playerWallet: string) => {
    try {
      setLoading({ isLoading: true, operation: 'Registering for tournament' });
      
      const result = await apiClient.registerForTournament({
        tournament_id: tournamentId,
        player_wallet: playerWallet
      });
      
      if (result.success) {
        // Refresh tournaments list
        await fetchTournaments();
        return result;
      } else {
        throw new Error(result.error || 'Failed to register for tournament');
      }
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError({
        hasError: true,
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setLoading({ isLoading: false });
    }
  }, [fetchTournaments]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  return {
    tournaments,
    loading,
    error,
    refetch: fetchTournaments,
    createTournament,
    registerForTournament
  };
};

// ==================== STAKING HOOK ====================

export const useStaking = () => {
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: true });
  const [error, setError] = useState<ErrorState>({ hasError: false, message: '', timestamp: '' });

  const fetchStakingPools = useCallback(async () => {
    try {
      setLoading({ isLoading: true, operation: 'Fetching staking pools' });
      setError({ hasError: false, message: '', timestamp: '' });
      
      const data = await apiClient.getAllStakingPools();
      setStakingPools(data);
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError({
        hasError: true,
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      console.error('Error fetching staking pools:', err);
    } finally {
      setLoading({ isLoading: false });
    }
  }, []);

  const stakeTokens = useCallback(async (poolId: number, stakerWallet: string, amount: number) => {
    try {
      setLoading({ isLoading: true, operation: 'Staking tokens' });
      
      const result = await apiClient.stakeTokens({
        pool_id: poolId,
        staker_wallet: stakerWallet,
        amount: amount
      });
      
      if (result.success) {
        // Refresh staking pools
        await fetchStakingPools();
        return result;
      } else {
        throw new Error(result.error || 'Failed to stake tokens');
      }
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError({
        hasError: true,
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setLoading({ isLoading: false });
    }
  }, [fetchStakingPools]);

  useEffect(() => {
    fetchStakingPools();
  }, [fetchStakingPools]);

  return {
    stakingPools,
    loading,
    error,
    refetch: fetchStakingPools,
    stakeTokens
  };
};

// ==================== GOVERNANCE HOOK ====================

export const useGovernance = () => {
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: true });
  const [error, setError] = useState<ErrorState>({ hasError: false, message: '', timestamp: '' });

  const fetchProposals = useCallback(async () => {
    try {
      setLoading({ isLoading: true, operation: 'Fetching governance proposals' });
      setError({ hasError: false, message: '', timestamp: '' });
      
      const data = await apiClient.getAllProposals();
      setProposals(data);
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError({
        hasError: true,
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      console.error('Error fetching proposals:', err);
    } finally {
      setLoading({ isLoading: false });
    }
  }, []);

  const voteOnProposal = useCallback(async (
    proposalId: number,
    voterWallet: string,
    vote: boolean,
    votingPower: number = 1
  ) => {
    try {
      setLoading({ isLoading: true, operation: 'Casting vote' });
      
      const result = await apiClient.voteOnProposal({
        proposal_id: proposalId,
        voter_wallet: voterWallet,
        vote: vote,
        voting_power: votingPower
      });
      
      if (result.success) {
        // Refresh proposals
        await fetchProposals();
        return result;
      } else {
        throw new Error(result.error || 'Failed to cast vote');
      }
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError({
        hasError: true,
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setLoading({ isLoading: false });
    }
  }, [fetchProposals]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  return {
    proposals,
    loading,
    error,
    refetch: fetchProposals,
    voteOnProposal
  };
};

// ==================== WALLET HOOK ====================

export const useWallet = (walletAddress?: string) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false });
  const [error, setError] = useState<ErrorState>({ hasError: false, message: '', timestamp: '' });

  const fetchWalletInfo = useCallback(async (address: string) => {
    try {
      setLoading({ isLoading: true, operation: 'Fetching wallet info' });
      setError({ hasError: false, message: '', timestamp: '' });
      
      const data = await apiClient.getWalletInfo(address);
      setWalletInfo(data);
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError({
        hasError: true,
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      console.error('Error fetching wallet info:', err);
    } finally {
      setLoading({ isLoading: false });
    }
  }, []);

  useEffect(() => {
    if (walletAddress) {
      fetchWalletInfo(walletAddress);
    }
  }, [walletAddress, fetchWalletInfo]);

  return {
    walletInfo,
    loading,
    error,
    refetch: walletAddress ? () => fetchWalletInfo(walletAddress) : undefined
  };
};

// ==================== PLATFORM ANALYTICS HOOK ====================

export const usePlatformAnalytics = () => {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: true });
  const [error, setError] = useState<ErrorState>({ hasError: false, message: '', timestamp: '' });

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading({ isLoading: true, operation: 'Fetching platform analytics' });
      setError({ hasError: false, message: '', timestamp: '' });
      
      const result = await apiClient.getPlatformAnalytics();
      
      if (result.success) {
        setAnalytics(result.analytics);
      } else {
        throw new Error(result.error || 'Failed to fetch analytics');
      }
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError({
        hasError: true,
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading({ isLoading: false });
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};

// ==================== BLOCKCHAIN STATUS HOOK ====================

export const useBlockchainStatus = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: true });
  const [error, setError] = useState<ErrorState>({ hasError: false, message: '', timestamp: '' });

  const fetchStatus = useCallback(async () => {
    try {
      setLoading({ isLoading: true, operation: 'Checking blockchain status' });
      setError({ hasError: false, message: '', timestamp: '' });
      
      const [healthResult, networkResult] = await Promise.all([
        apiClient.getHealthStatus(),
        apiClient.getNetworkStats()
      ]);
      
      setStatus({
        health: healthResult,
        network: networkResult.success ? networkResult.data : null
      });
      
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError({
        hasError: true,
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      console.error('Error fetching blockchain status:', err);
    } finally {
      setLoading({ isLoading: false });
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30 * 1000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus
  };
};

// ==================== COMBINED DASHBOARD HOOK ====================

export const useDashboardData = (walletAddress?: string) => {
  const tournaments = useTournaments();
  const staking = useStaking();
  const governance = useGovernance();
  const wallet = useWallet(walletAddress);
  const analytics = usePlatformAnalytics();

  // Generate real-time key metrics from blockchain data
  const keyMetrics: KeyMetric[] = [
    {
      id: 'active-tournaments',
      label: 'Active Tournaments:',
      value: tournaments.tournaments.filter(t => t.status === 'Live' || t.status === 'Upcoming').length.toString(),
      icon: require('lucide-react').Activity
    },
    {
      id: 'total-staked',
      label: 'Total Staked:',
      value: `${staking.stakingPools.reduce((sum, pool) => sum + pool.totalStaked, 0).toLocaleString()} SOLP`,
      icon: require('lucide-react').Award
    },
    {
      id: 'wallet-balance',
      label: 'SOLP Balance:',
      value: wallet.walletInfo ? `${wallet.walletInfo.solp_balance.toFixed(2)}` : '0.00',
      icon: require('lucide-react').DollarSign
    },
    {
      id: 'governance-proposals',
      label: 'Active Proposals:',
      value: governance.proposals.filter(p => p.status === 'active').length.toString(),
      icon: require('lucide-react').Crown
    }
  ];

  // Generate recent activity from blockchain data
  const recentActivity: RecentActivity[] = [
    ...tournaments.tournaments.slice(0, 3).map(t => ({
      id: `tournament-${t.id}`,
      type: 'tournament' as const,
      description: `Tournament "${t.name}" ${t.status.toLowerCase()}`,
      amount: t.buyIn,
      timestamp: t.startTime,
      status: 'completed' as const,
      transactionHash: t.transaction_signature
    })),
    ...staking.stakingPools.slice(0, 2).map(p => ({
      id: `staking-${p.id}`,
      type: 'staking' as const,
      description: `Staking pool ${p.name} - ${p.apy}% APY`,
      amount: p.totalStaked,
      timestamp: p.createdAt,
      status: 'completed' as const
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  const isLoading = tournaments.loading.isLoading || 
                   staking.loading.isLoading || 
                   governance.loading.isLoading ||
                   wallet.loading.isLoading ||
                   analytics.loading.isLoading;

  const hasError = tournaments.error.hasError || 
                   staking.error.hasError || 
                   governance.error.hasError ||
                   wallet.error.hasError ||
                   analytics.error.hasError;

  return {
    tournaments: tournaments.tournaments,
    stakingPools: staking.stakingPools,
    proposals: governance.proposals,
    walletInfo: wallet.walletInfo,
    analytics: analytics.analytics,
    keyMetrics,
    recentActivity,
    loading: { isLoading },
    error: { 
      hasError, 
      message: hasError ? 'Some data could not be loaded' : '',
      timestamp: new Date().toISOString()
    },
    refetch: () => {
      tournaments.refetch();
      staking.refetch();
      governance.refetch();
      if (wallet.refetch) wallet.refetch();
      analytics.refetch();
    }
  };
};

