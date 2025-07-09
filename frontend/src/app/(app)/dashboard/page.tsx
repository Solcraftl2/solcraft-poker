'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Activity, Award, TrendingUp, Crown, Landmark, AlertCircle, Wifi, WifiOff, Home, User, Trophy, ArrowLeftRight, Send, Rocket, Coins } from 'lucide-react';
import Link from 'next/link';

// Simple mock data for immediate functionality
const mockKeyMetrics = [
  { title: "Total Balance", value: "$12,450.00", change: "+5.2%", icon: Landmark },
  { title: "Active Tournaments", value: "3", change: "+1", icon: Trophy },
  { title: "Total Winnings", value: "$2,340.00", change: "+12.5%", icon: Award },
  { title: "Staked SOLP", value: "1,250", change: "+8.3%", icon: Coins },
];

const mockTournaments = [
  { id: 1, name: "Weekly High Stakes", buyIn: 100, prizePool: 5000, players: 45, status: "Live" },
  { id: 2, name: "Daily Grind", buyIn: 25, prizePool: 1250, players: 32, status: "Registering" },
  { id: 3, name: "Sunday Special", buyIn: 200, prizePool: 10000, players: 28, status: "Starting Soon" },
];

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    // Check if wallet is connected
    const checkWalletConnection = () => {
      const wallet = localStorage.getItem('solcraft_wallet');
      const session = localStorage.getItem('solcraft_session');
      
      if (wallet || session) {
        setWalletConnected(true);
      }
      
      setIsLoading(false);
    };

    checkWalletConnection();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-[#E573A5] to-[#73D2E5] text-transparent bg-clip-text">
                SolCraft
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">Connected</span>
              </div>
              {walletConnected && (
                <div className="text-sm text-purple-400">
                  Wallet Connected
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900/30 min-h-screen border-r border-gray-800">
          <nav className="p-4 space-y-2">
            <Link href="/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-purple-600/20 text-purple-400">
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link href="/profile" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
            <Link href="/tournaments" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300">
              <Trophy className="h-5 w-5" />
              <span>Tournaments</span>
            </Link>
            <Link href="/swap" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300">
              <ArrowLeftRight className="h-5 w-5" />
              <span>Swap</span>
            </Link>
            <Link href="/send" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300">
              <Send className="h-5 w-5" />
              <span>Deposit/Send</span>
            </Link>
            <Link href="/launchpad" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300">
              <Rocket className="h-5 w-5" />
              <span>Launchpad</span>
            </Link>
            <Link href="/staking" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300">
              <Coins className="h-5 w-5" />
              <span>Staking</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome to SolCraft Poker Platform</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {mockKeyMetrics.map((metric, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">{metric.title}</p>
                      <p className="text-2xl font-bold text-white">{metric.value}</p>
                      <p className="text-sm text-green-500">{metric.change}</p>
                    </div>
                    <metric.icon className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Featured Tournaments */}
          <Card className="bg-gray-900/50 border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-purple-400" />
                <span>Featured Tournaments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTournaments.map((tournament) => (
                  <div key={tournament.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-white">{tournament.name}</h3>
                      <p className="text-sm text-gray-400">
                        Buy-in: ${tournament.buyIn} • Prize Pool: ${tournament.prizePool} • Players: {tournament.players}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        tournament.status === 'Live' ? 'bg-green-600 text-white' :
                        tournament.status === 'Registering' ? 'bg-blue-600 text-white' :
                        'bg-yellow-600 text-white'
                      }`}>
                        {tournament.status}
                      </span>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Join
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-purple-400" />
                  <span>Platform Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Players</span>
                    <span className="text-white font-semibold">2,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Tournaments</span>
                    <span className="text-white font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Prize Pool</span>
                    <span className="text-white font-semibold">$45,230</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">SOLP Staked</span>
                    <span className="text-white font-semibold">125,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                    <Link href="/tournaments">Join Tournament</Link>
                  </Button>
                  <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white" asChild>
                    <Link href="/staking">Stake SOLP</Link>
                  </Button>
                  <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white" asChild>
                    <Link href="/swap">Swap Tokens</Link>
                  </Button>
                  <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white" asChild>
                    <Link href="/launchpad">Launch Token</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

