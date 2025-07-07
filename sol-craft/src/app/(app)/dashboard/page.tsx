
'use client';

import { useState, useEffect } from 'react';
import { KeyMetricsCard } from "@/components/dashboard/figma/key-metrics-card";
import { MyBalanceCard } from "@/components/dashboard/figma/my-balance-card";
import { RecentActivityTable } from "@/components/dashboard/figma/recent-activity-table";
import { FigmaPortfolioPerformanceChart } from "@/components/dashboard/figma/figma-portfolio-performance-chart";
import { PortfolioAllocationCard } from "@/components/dashboard/figma/portfolio-allocation-card";
import { TopCryptocurrencyTable } from "@/components/dashboard/figma/top-cryptocurrency-table";
import { TournamentInvestmentPoolCard } from "@/components/dashboard/tournament-investment-pool-card"; // New Import

import {
  mockTournaments,
  mockRecentActivity,
  mockFigmaPortfolioPerformance,
  mockKeyMetrics as defaultMockKeyMetrics,
  mockPortfolioAllocation,
  mockTopCryptocurrencies,
  mockInvestments,
  mockPoolState // New Import
} from "@/lib/mock-data";
import { TournamentCard } from "@/components/tournaments/tournament-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile, Investment, KeyMetric, Tournament } from '@/lib/types';
import { Loader2, Activity, Award, TrendingUp, Crown, Landmark } from 'lucide-react';

export default function DashboardPage() {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dynamicKeyMetrics, setDynamicKeyMetrics] = useState<KeyMetric[]>(defaultMockKeyMetrics);
  const [isLoading, setIsLoading] = useState(true);

  const featuredTournaments = mockTournaments.filter(t => t.status === 'Upcoming' || t.status === 'Live').slice(0, 3);

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

            const activeInvestmentsCount = mockInvestments.filter(
              (inv) => inv.investorId === profileData.uid && inv.status === 'Active'
            ).length;
            
            const newKeyMetrics: KeyMetric[] = [
              { 
                id: 'active-investments', 
                label: 'Active Investments:', 
                value: activeInvestmentsCount.toString(), 
                icon: Activity 
              },
              { 
                id: 'total-invested', 
                label: 'Total Invested:', 
                value: `$${(profileData.totalInvested ?? 0).toLocaleString()}`, 
                icon: Award 
              },
              { 
                id: 'lifetime-roi', 
                label: 'Lifetime ROI:', 
                value: `${(profileData.overallReturn ?? 0).toFixed(1)}%`, 
                icon: TrendingUp, 
                valueClassName: (profileData.overallReturn ?? 0) >= 0 ? "text-green-500" : "text-red-500" 
              },
              { 
                id: 'current-tier', 
                label: 'Current Tier:', 
                value: profileData.currentInvestmentTierName || "N/A", 
                icon: Crown 
              },
            ];
            setDynamicKeyMetrics(newKeyMetrics);

          } else {
            setUserProfile(null); 
            setDynamicKeyMetrics(defaultMockKeyMetrics); 
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          setUserProfile(null);
          setDynamicKeyMetrics(defaultMockKeyMetrics); 
        }
      } else {
        setAuthUser(null);
        setUserProfile(null);
        setDynamicKeyMetrics(defaultMockKeyMetrics); 
      }
      setIsLoading(false);
    });

    return () => unsubscribeAuth();
  }, []); 

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Row: Portfolio Allocation, Key Metrics, My Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PortfolioAllocationCard data={mockPortfolioAllocation} />
        <KeyMetricsCard metrics={dynamicKeyMetrics} />
        <MyBalanceCard />
      </div>

      {/* Top Cryptocurrency Table */}
      <TopCryptocurrencyTable cryptocurrencies={mockTopCryptocurrencies} />

      {/* Platform Pool States Section - New */}
      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
                <Landmark className="mr-2 h-6 w-6 text-primary"/>
                Platform Pool States
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TournamentInvestmentPoolCard poolState={mockPoolState} />
                {/* We can add PlayerDepositPoolSummaryCard here later */}
            </div>
        </CardContent>
      </Card>


      {/* Featured Tournaments Section */}
      {featuredTournaments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Featured Tournaments</CardTitle>
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

      {/* Bottom Row: Recent Activity and Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivityTable activities={mockRecentActivity} className="lg:col-span-2" />
        <FigmaPortfolioPerformanceChart data={mockFigmaPortfolioPerformance} className="lg:col-span-1" />
      </div>
    </div>
  );
}
