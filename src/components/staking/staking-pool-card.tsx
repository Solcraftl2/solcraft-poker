
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { StakingPool } from '@/lib/types';
import { TrendingUp, Lock, DollarSign, Percent, Layers, Info, ShieldCheck, Shield, ShieldAlert, Zap, Gem, CheckCircle } from 'lucide-react';

interface StakingPoolCardProps {
  pool: StakingPool;
}

export function StakingPoolCard({ pool }: StakingPoolCardProps) {
  
  const getRiskBadgeVariant = (riskLevel: StakingPool['riskLevel']): "default" | "secondary" | "destructive" | "outline" => {
    switch (riskLevel) {
      case 'Low': return 'secondary';
      case 'Medium': return 'default';
      case 'High': return 'destructive';
      default: return 'outline';
    }
  };

  const getRiskIcon = (riskLevel: StakingPool['riskLevel']) => {
    switch (riskLevel) {
      case 'Low': return <ShieldCheck className="h-4 w-4 mr-1 text-green-500" />;
      case 'Medium': return <Shield className="h-4 w-4 mr-1 text-yellow-500" />;
      case 'High': return <ShieldAlert className="h-4 w-4 mr-1 text-red-500" />;
      default: return <Info className="h-4 w-4 mr-1 text-muted-foreground" />;
    }
  };

  const getTypeBadgeClassNames = (type: StakingPool['type']): string => {
    switch (type) {
      case 'Native': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Liquid': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'LP Farming': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'border-muted-foreground/30 text-muted-foreground';
    }
  };


  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-primary/10 transition-shadow duration-300 border border-border hover:border-primary/50">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <Image
              src={pool.assetLogoUrl}
              alt={`${pool.assetName} logo`}
              width={36}
              height={36}
              className="rounded-full border"
              data-ai-hint={`${pool.assetTicker} logo crypto coin`}
            />
            <div>
              <CardTitle className="font-headline text-md leading-tight">{pool.assetName}</CardTitle>
              <CardDescription className="text-xs text-primary">{pool.assetTicker}</CardDescription>
            </div>
          </div>
          {pool.isFeatured && <Badge variant="default" className="text-xs bg-accent text-accent-foreground"><Gem className="h-3 w-3 mr-1" />Featured</Badge>}
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
            <Badge variant={getRiskBadgeVariant(pool.riskLevel)} className="text-xs">
                {getRiskIcon(pool.riskLevel)}
                {pool.riskLevel} Risk
            </Badge>
            <Badge variant="outline" className={`text-xs ${getTypeBadgeClassNames(pool.type)}`}>
                {pool.type}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-3 text-sm">
        <div className="p-3 bg-primary/5 rounded-md border border-primary/20">
            <div className="flex items-baseline justify-center text-primary">
                <span className="text-3xl font-bold">{typeof pool.apy === 'number' ? pool.apy.toFixed(2) : pool.apy}</span>
                <span className="text-lg font-medium">%</span>
                <span className="ml-1 text-xs text-primary/80">APY</span>
            </div>
        </div>

        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center"><Lock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/70"/>Lock-up:</span>
                <span className="font-medium text-foreground">{pool.lockUpPeriod}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center"><Layers className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/70"/>Platform:</span>
                <span className="font-medium text-foreground">{pool.platform}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center"><DollarSign className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/70"/>Total Staked:</span>
                <span className="font-medium text-foreground">${pool.totalStakedInPoolUSD.toLocaleString()}</span>
            </div>
            {pool.minStake !== undefined && (
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center"><Info className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/70"/>Min. Stake:</span>
                    <span className="font-medium text-foreground">{pool.minStake.toLocaleString()} {pool.assetTicker}</span>
                </div>
            )}
        </div>

        {pool.userStakedAmount !== undefined && pool.userStakedAmount > 0 && (
          <div className="mt-3 pt-3 border-t border-dashed">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Your Stake:</h4>
            <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium text-foreground">{pool.userStakedAmount.toLocaleString()} {pool.assetTicker}</span>
            </div>
             <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Rewards:</span>
                <span className="font-medium text-green-500">{pool.userRewardsEarned?.toLocaleString() || 0} {pool.assetTicker}</span>
            </div>
          </div>
        )}

      </CardContent>
      <CardFooter className="p-4 grid grid-cols-2 gap-2 border-t">
        <Button variant="outline" asChild>
          <Link href={pool.detailsLink}>
            <Info className="mr-2 h-4 w-4" /> Learn More
          </Link>
        </Button>
        <Button variant="default" disabled={!pool.availableToStake}>
            {pool.availableToStake ? <Zap className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            {pool.availableToStake ? 'Stake Now' : 'Staking Closed'}
        </Button>
      </CardFooter>
    </Card>
  );
}

    