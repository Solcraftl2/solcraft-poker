'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Droplets, 
  TrendingUp, 
  DollarSign, 
  Percent,
  Plus,
  Minus,
  ArrowUpDown,
  Info,
  Zap,
  Shield
} from 'lucide-react';
import { useSolcraftWallet } from '@/hooks/useSolcraftWallet';
import { toast } from 'sonner';

interface LiquidityPoolData {
  id: string;
  name: string;
  tokenA: {
    symbol: string;
    amount: number;
    price: number;
  };
  tokenB: {
    symbol: string;
    amount: number;
    price: number;
  };
  totalLiquidity: number;
  apr: number;
  volume24h: number;
  fees24h: number;
  userLiquidity?: number;
  userShare?: number;
}

interface StakingPool {
  id: string;
  name: string;
  token: string;
  apr: number;
  totalStaked: number;
  userStaked?: number;
  lockPeriod: number; // in days
  rewards: {
    token: string;
    amount: number;
  }[];
}

const mockLiquidityPools: LiquidityPoolData[] = [
  {
    id: '1',
    name: 'SOLP/SOL',
    tokenA: { symbol: 'SOLP', amount: 1250000, price: 0.05 },
    tokenB: { symbol: 'SOL', amount: 3125, price: 20 },
    totalLiquidity: 125000,
    apr: 45.2,
    volume24h: 15000,
    fees24h: 45,
    userLiquidity: 2500,
    userShare: 2.0
  },
  {
    id: '2',
    name: 'SOLP/USDC',
    tokenA: { symbol: 'SOLP', amount: 2000000, price: 0.05 },
    tokenB: { symbol: 'USDC', amount: 100000, price: 1 },
    totalLiquidity: 200000,
    apr: 38.7,
    volume24h: 25000,
    fees24h: 75,
    userLiquidity: 1200,
    userShare: 0.6
  },
  {
    id: '3',
    name: 'SOL/USDC',
    tokenA: { symbol: 'SOL', amount: 5000, price: 20 },
    tokenB: { symbol: 'USDC', amount: 100000, price: 1 },
    totalLiquidity: 200000,
    apr: 25.3,
    volume24h: 50000,
    fees24h: 150
  }
];

const mockStakingPools: StakingPool[] = [
  {
    id: '1',
    name: 'SOLP Staking',
    token: 'SOLP',
    apr: 65.4,
    totalStaked: 5000000,
    userStaked: 10000,
    lockPeriod: 30,
    rewards: [
      { token: 'SOLP', amount: 150 },
      { token: 'SOL', amount: 0.5 }
    ]
  },
  {
    id: '2',
    name: 'Tournament Rewards Pool',
    token: 'SOLP',
    apr: 85.2,
    totalStaked: 2000000,
    lockPeriod: 90,
    rewards: [
      { token: 'SOLP', amount: 0 },
      { token: 'Tournament Tickets', amount: 5 }
    ]
  }
];

function LiquidityPoolCard({ pool }: { pool: LiquidityPoolData }) {
  const [showAddLiquidity, setShowAddLiquidity] = useState(false);
  const [tokenAAmount, setTokenAAmount] = useState('');
  const [tokenBAmount, setTokenBAmount] = useState('');
  const { connected, hasSufficientBalance } = useSolcraftWallet();

  const handleAddLiquidity = async () => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }

    // Simulate adding liquidity
    toast.success(`Added liquidity to ${pool.name} pool`);
    setShowAddLiquidity(false);
    setTokenAAmount('');
    setTokenBAmount('');
  };

  const handleRemoveLiquidity = async () => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }

    // Simulate removing liquidity
    toast.success(`Removed liquidity from ${pool.name} pool`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            {pool.name}
          </CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {pool.apr.toFixed(1)}% APR
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Pool composition */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">{pool.tokenA.symbol}</p>
            <p className="font-semibold">{pool.tokenA.amount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">${(pool.tokenA.amount * pool.tokenA.price).toLocaleString()}</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">{pool.tokenB.symbol}</p>
            <p className="font-semibold">{pool.tokenB.amount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">${(pool.tokenB.amount * pool.tokenB.price).toLocaleString()}</p>
          </div>
        </div>

        {/* Pool stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Liquidity</p>
            <p className="font-semibold">${pool.totalLiquidity.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">24h Volume</p>
            <p className="font-semibold">${pool.volume24h.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">24h Fees</p>
            <p className="font-semibold">${pool.fees24h.toLocaleString()}</p>
          </div>
        </div>

        {/* User position */}
        {pool.userLiquidity && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Your Position</span>
              <span className="text-sm text-muted-foreground">{pool.userShare}% of pool</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Liquidity</span>
              <span className="font-semibold">${pool.userLiquidity.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Dialog open={showAddLiquidity} onOpenChange={setShowAddLiquidity}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Liquidity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Liquidity to {pool.name}</DialogTitle>
                <DialogDescription>
                  Provide equal value of both tokens to earn trading fees.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tokenA">Amount ({pool.tokenA.symbol})</Label>
                  <Input
                    id="tokenA"
                    value={tokenAAmount}
                    onChange={(e) => setTokenAAmount(e.target.value)}
                    placeholder="0.0"
                    type="number"
                  />
                </div>
                
                <div className="flex justify-center">
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                </div>
                
                <div>
                  <Label htmlFor="tokenB">Amount ({pool.tokenB.symbol})</Label>
                  <Input
                    id="tokenB"
                    value={tokenBAmount}
                    onChange={(e) => setTokenBAmount(e.target.value)}
                    placeholder="0.0"
                    type="number"
                  />
                </div>
                
                <Button onClick={handleAddLiquidity} className="w-full">
                  Add Liquidity
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {pool.userLiquidity && (
            <Button variant="outline" onClick={handleRemoveLiquidity}>
              <Minus className="w-4 h-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StakingPoolCard({ pool }: { pool: StakingPool }) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const { connected } = useSolcraftWallet();

  const handleStake = async () => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }

    toast.success(`Staked ${stakeAmount} ${pool.token}`);
    setShowStakeDialog(false);
    setStakeAmount('');
  };

  const handleUnstake = async () => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }

    toast.success(`Unstaked from ${pool.name}`);
  };

  const handleClaimRewards = async () => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }

    toast.success('Rewards claimed successfully');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-500" />
            {pool.name}
          </CardTitle>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            {pool.apr.toFixed(1)}% APR
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Pool info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Staked</p>
            <p className="font-semibold">{pool.totalStaked.toLocaleString()} {pool.token}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Lock Period</p>
            <p className="font-semibold">{pool.lockPeriod} days</p>
          </div>
        </div>

        {/* User position */}
        {pool.userStaked && (
          <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Your Stake</span>
              <span className="font-semibold">{pool.userStaked.toLocaleString()} {pool.token}</span>
            </div>
            
            {/* Pending rewards */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Pending Rewards:</p>
              {pool.rewards.map((reward, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{reward.token}</span>
                  <span className="font-medium">{reward.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Dialog open={showStakeDialog} onOpenChange={setShowStakeDialog}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Stake
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Stake {pool.token}</DialogTitle>
                <DialogDescription>
                  Stake your tokens to earn rewards. Lock period: {pool.lockPeriod} days.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stakeAmount">Amount ({pool.token})</Label>
                  <Input
                    id="stakeAmount"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.0"
                    type="number"
                  />
                </div>
                
                <Button onClick={handleStake} className="w-full">
                  Stake {pool.token}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {pool.userStaked && (
            <>
              <Button variant="outline" onClick={handleUnstake}>
                Unstake
              </Button>
              <Button variant="outline" onClick={handleClaimRewards}>
                <Zap className="w-4 h-4 mr-2" />
                Claim
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function LiquidityPool() {
  const [liquidityPools, setLiquidityPools] = useState<LiquidityPoolData[]>(mockLiquidityPools);
  const [stakingPools, setStakingPools] = useState<StakingPool[]>(mockStakingPools);
  const { connected, balance } = useSolcraftWallet();

  const totalLiquidityProvided = liquidityPools.reduce((sum, pool) => sum + (pool.userLiquidity || 0), 0);
  const totalStaked = stakingPools.reduce((sum, pool) => sum + (pool.userStaked || 0), 0);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">DeFi Hub</h1>
        <p className="text-muted-foreground">
          Provide liquidity and stake tokens to earn rewards in the SolCraft ecosystem
        </p>
      </div>

      {/* User stats */}
      {connected && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Liquidity</p>
                  <p className="text-xl font-bold">${totalLiquidityProvided.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Staked</p>
                  <p className="text-xl font-bold">{totalStaked.toLocaleString()} SOLP</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Est. Daily Rewards</p>
                  <p className="text-xl font-bold">$45.20</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main content */}
      <Tabs defaultValue="liquidity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="liquidity">Liquidity Pools</TabsTrigger>
          <TabsTrigger value="staking">Staking Pools</TabsTrigger>
        </TabsList>
        
        <TabsContent value="liquidity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liquidityPools.map((pool) => (
              <LiquidityPoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="staking" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stakingPools.map((pool) => (
              <StakingPoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Info section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            How it Works
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Liquidity Pools</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Provide equal value of two tokens</li>
              <li>• Earn trading fees from swaps</li>
              <li>• Receive LP tokens representing your share</li>
              <li>• Withdraw anytime with accumulated fees</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Staking Pools</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Lock tokens for a fixed period</li>
              <li>• Earn rewards in SOLP and other tokens</li>
              <li>• Higher APR for longer lock periods</li>
              <li>• Claim rewards anytime during lock period</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

