'use client';

import { useState, useEffect } from 'react';
import { KeyMetricsCard } from "@/components/dashboard/figma/key-metrics-card";
import { MyBalanceCard } from "@/components/dashboard/figma/my-balance-card";
import { RecentActivityTable } from "@/components/dashboard/figma/recent-activity-table";
import { FigmaPortfolioPerformanceChart } from "@/components/dashboard/figma/figma-portfolio-performance-chart";
import { PortfolioAllocationCard } from "@/components/dashboard/figma/portfolio-allocation-card";
import { TopCryptocurrencyTable } from "@/components/dashboard/figma/top-cryptocurrency-table";
import { TournamentInvestmentPoolCard } from "@/components/dashboard/tournament-investment-pool-card"; 

// Import blockchain data hooks instead of mock data
import { useDashboardData } from "@/hooks/useBlockchainData";
import {
  mockFigmaPortfolioPerformance,
  mockPortfolioAllocation,
  mockTopCryptocurrencies,
  mockPoolState 
} from "@/lib/mock-data";
import { TournamentCard } from "@/components/tournaments/tournament-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Loader2, Activity, Award, TrendingUp, Crown, Landmark, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DashboardPage() {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Use blockchain data instead of mock data
  const {
    tournaments,
    stakingPools,
    proposals,
    walletInfo,
    analytics,
    keyMetrics,
    recentActivity,
    loading,
    error,
    refetch
  } = useDashboardData(userProfile?.walletAddress);

  // Get featured tournaments from real blockchain data
  const featuredTournaments = tournaments
    .filter(t => t.status === 'Upcoming' || t.status === 'Live')
    .slice(0, 3);

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
          } else {
            setUserProfile(null); 
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        setAuthUser(null);
        setUserProfile(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []); 

  // Show loading state
  if (isAuthLoading || loading.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading blockchain data...</p>
      </div>
    );
  }

  // Show error state with retry option
  if (error.hasError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load blockchain data: {error.message}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
        
        {/* Show partial UI with available data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PortfolioAllocationCard data={mockPortfolioAllocation} />
          <KeyMetricsCard metrics={keyMetrics} />
          <MyBalanceCard walletInfo={walletInfo} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time blockchain data display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PortfolioAllocationCard data={mockPortfolioAllocation} />
        <KeyMetricsCard metrics={keyMetrics} />
        <MyBalanceCard walletInfo={walletInfo} />
      </div>

      <TopCryptocurrencyTable cryptocurrencies={mockTopCryptocurrencies} />

      {/* Platform Pool States with real analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <Landmark className="mr-2 h-6 w-6 text-primary"/>
            Platform Pool States
            {analytics && (
              <span className="ml-auto text-sm text-muted-foreground">
                Last updated: {new Date(analytics.last_updated * 1000).toLocaleTimeString()}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TournamentInvestmentPoolCard 
              poolState={{
                ...mockPoolState,
                totalValueLocked: analytics?.staking.total_staked || mockPoolState.totalValueLocked,
                totalUsers: analytics?.staking.active_stakers || mockPoolState.totalUsers,
                totalRewards: stakingPools.reduce((sum, pool) => sum + pool.rewardsDistributed, 0) || mockPoolState.totalRewards,
                averageAPY: stakingPools.length > 0 
                  ? stakingPools.reduce((sum, pool) => sum + pool.apy, 0) / stakingPools.length 
                  : mockPoolState.averageAPY
              }} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Featured Tournaments from blockchain */}
      {featuredTournaments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              Featured Tournaments
              <span className="ml-auto text-sm text-muted-foreground">
                {tournaments.length} total tournaments
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTournaments.map(tournament => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No tournaments message */}
      {featuredTournaments.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Featured Tournaments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active tournaments at the moment.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back later or create your own tournament!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time activity and performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivityTable 
          activities={recentActivity} 
          className="lg:col-span-2" 
        />
        <FigmaPortfolioPerformanceChart 
          data={mockFigmaPortfolioPerformance} 
          className="lg:col-span-1" 
        />
      </div>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>Tournaments: {tournaments.length}</p>
                <p>Staking Pools: {stakingPools.length}</p>
                <p>Proposals: {proposals.length}</p>
              </div>
              <div>
                <p>Wallet Connected: {walletInfo ? 'Yes' : 'No'}</p>
                <p>User Profile: {userProfile ? 'Loaded' : 'None'}</p>
                <p>Analytics: {analytics ? 'Available' : 'Loading'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

