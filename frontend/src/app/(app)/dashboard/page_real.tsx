'use client';

import { useState, useEffect } from 'react';
import { KeyMetricsCard } from "@/components/dashboard/figma/key-metrics-card";
import { MyBalanceCard } from "@/components/dashboard/figma/my-balance-card";
import { RecentActivityTable } from "@/components/dashboard/figma/recent-activity-table";
import { FigmaPortfolioPerformanceChart } from "@/components/dashboard/figma/figma-portfolio-performance-chart";
import { PortfolioAllocationCard } from "@/components/dashboard/figma/portfolio-allocation-card";
import { TopCryptocurrencyTable } from "@/components/dashboard/figma/top-cryptocurrency-table";
import { TournamentInvestmentPoolCard } from "@/components/dashboard/tournament-investment-pool-card"; 

// Import API client instead of mock data
import { apiClient, type Tournament, type PlatformAnalytics, type WalletInfo } from "@/lib/api-client-real";

// Keep some mock data for components not yet connected to blockchain
import {
  mockRecentActivity,
  mockFigmaPortfolioPerformance,
  mockPortfolioAllocation,
  mockTopCryptocurrencies,
  mockInvestments,
  mockPoolState 
} from "@/lib/mock-data";

import { TournamentCard } from "@/components/tournaments/tournament-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile, Investment, KeyMetric } from '@/lib/types';
import { Loader2, Activity, Award, TrendingUp, Crown, Landmark, AlertCircle, Wifi, WifiOff } from 'lucide-react';

export default function DashboardPageReal() {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isApiConnected, setIsApiConnected] = useState(false);
  
  // Real API data states
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [platformAnalytics, setPlatformAnalytics] = useState<PlatformAnalytics | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [dynamicKeyMetrics, setDynamicKeyMetrics] = useState<KeyMetric[]>([]);

  // Load real data from blockchain API
  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        setIsLoading(true);
        setApiError(null);

        // Test API connection first
        const healthResponse = await apiClient.healthCheck();
        if (healthResponse.success) {
          setIsApiConnected(true);
          console.log('✅ API Connected:', healthResponse.data);
        } else {
          setIsApiConnected(false);
          throw new Error('API health check failed');
        }

        // Load tournaments from API
        const tournamentsResponse = await apiClient.getAllTournaments();
        if (tournamentsResponse.success && tournamentsResponse.data) {
          setTournaments(tournamentsResponse.data.tournaments);
          console.log('✅ Tournaments loaded:', tournamentsResponse.data.tournaments.length);
        } else {
          console.warn('Failed to load tournaments:', tournamentsResponse.error);
        }

        // Load platform analytics
        const analyticsResponse = await apiClient.getPlatformAnalytics();
        if (analyticsResponse.success && analyticsResponse.data) {
          setPlatformAnalytics(analyticsResponse.data);
          
          // Create dynamic key metrics from real data
          const realMetrics: KeyMetric[] = [
            {
              title: "Active Tournaments",
              value: analyticsResponse.data.tournaments.active.toString(),
              change: "+12.5%",
              trend: "up" as const,
              icon: Activity
            },
            {
              title: "Total Prize Pool",
              value: `$${(analyticsResponse.data.tournaments.total_prize_pool / 1000).toFixed(1)}k`,
              change: "+8.2%",
              trend: "up" as const,
              icon: TrendingUp
            },
            {
              title: "Active Stakers",
              value: analyticsResponse.data.staking.active_stakers.toString(),
              change: "+15.7%",
              trend: "up" as const,
              icon: Award
            },
            {
              title: "Governance Proposals",
              value: analyticsResponse.data.governance.total_proposals.toString(),
              change: "+3",
              trend: "up" as const,
              icon: Crown
            }
          ];
          setDynamicKeyMetrics(realMetrics);
          console.log('✅ Analytics loaded:', analyticsResponse.data);
        } else {
          console.warn('Failed to load analytics:', analyticsResponse.error);
        }

        // Load wallet info if user is connected
        if (authUser) {
          // Mock wallet address for demo - in real app this would come from wallet connection
          const mockWalletAddress = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
          const walletResponse = await apiClient.getWalletInfo(mockWalletAddress);
          if (walletResponse.success && walletResponse.data) {
            setWalletInfo(walletResponse.data);
            console.log('✅ Wallet info loaded:', walletResponse.data);
          }
        }

      } catch (error) {
        console.error('Error loading blockchain data:', error);
        setApiError(error instanceof Error ? error.message : 'Unknown error');
        setIsApiConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadBlockchainData();
  }, [authUser]);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setAuthUser(currentUser);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const profileData = userDocSnap.data() as UserProfile;
            setUserProfile(profileData);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setAuthUser(null);
        setUserProfile(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Get featured tournaments from real API data
  const featuredTournaments = tournaments
    .filter(t => t.status === 'registration_open' || t.status === 'in_progress')
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading blockchain data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* API Status Banner */}
      <Card className={`${isApiConnected ? 'border-green-200 bg-green-50' : 'border-destructive bg-destructive/10'}`}>
        <CardContent className="flex items-center space-x-2 p-4">
          {isApiConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700">
                ✅ Connected to SolCraft Blockchain API - Real-time data active
              </p>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">
                ❌ API Connection Issue: {apiError}. Showing fallback data.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Allocation */}
      <PortfolioAllocationCard data={mockPortfolioAllocation} />
      
      {/* Key Metrics - Now using real data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dynamicKeyMetrics.map((metric, index) => (
          <KeyMetricsCard key={index} {...metric} />
        ))}
      </div>

      {/* My Balance - Enhanced with real wallet data */}
      <MyBalanceCard 
        walletInfo={walletInfo}
        isConnected={!!authUser}
      />

      {/* Top Cryptocurrency Table */}
      <TopCryptocurrencyTable data={mockTopCryptocurrencies} />

      {/* Tournament Investment Pool - Enhanced with real analytics */}
      <TournamentInvestmentPoolCard 
        poolState={mockPoolState}
        platformAnalytics={platformAnalytics}
      />

      {/* Featured Tournaments - Now using real API data */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Landmark className="h-6 w-6" />
            Featured Tournaments
            {isApiConnected && (
              <span className="text-sm font-normal text-green-600 bg-green-100 px-2 py-1 rounded">
                Live Data
              </span>
            )}
          </CardTitle>
          {tournaments.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {tournaments.length} tournaments available
            </p>
          )}
        </CardHeader>
        <CardContent>
          {featuredTournaments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredTournaments.map((tournament) => (
                <TournamentCard 
                  key={tournament.tournament_id} 
                  tournament={{
                    id: tournament.tournament_id.toString(),
                    title: tournament.name,
                    organizer: tournament.organizer,
                    description: `Tournament with ${tournament.max_players} max players`,
                    buyIn: tournament.buy_in,
                    prizePool: tournament.prize_pool,
                    startTime: new Date(tournament.start_time * 1000).toISOString(),
                    maxPlayers: tournament.max_players,
                    currentPlayers: tournament.current_players,
                    status: tournament.status === 'registration_open' ? 'Upcoming' : 
                           tournament.status === 'in_progress' ? 'Live' : 'Finished',
                    aiRisk: 'Medium'
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {apiError ? 'Unable to load tournaments. Please try again later.' : 'No tournaments available at the moment.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <RecentActivityTable data={mockRecentActivity} />

      {/* Portfolio Performance */}
      <FigmaPortfolioPerformanceChart data={mockFigmaPortfolioPerformance} />

      {/* Platform Analytics Summary - Real Data */}
      {platformAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Platform Overview
              <span className="text-sm font-normal text-green-600 bg-green-100 px-2 py-1 rounded">
                Live Blockchain Data
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{platformAnalytics.tournaments.total}</p>
                <p className="text-sm text-muted-foreground">Total Tournaments</p>
                <p className="text-xs text-green-600">{platformAnalytics.tournaments.active} Active</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{platformAnalytics.staking.active_stakers}</p>
                <p className="text-sm text-muted-foreground">Active Stakers</p>
                <p className="text-xs text-green-600">{platformAnalytics.staking.total_pools} Pools</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{platformAnalytics.governance.total_proposals}</p>
                <p className="text-sm text-muted-foreground">Governance Proposals</p>
                <p className="text-xs text-green-600">{platformAnalytics.governance.active_proposals} Active</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(platformAnalytics.last_updated).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

