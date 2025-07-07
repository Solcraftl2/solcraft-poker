
'use client';

import type { PoolState } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Layers, TrendingUp, Landmark, CircleDollarSign, Activity, Server } from 'lucide-react'; // Added Landmark, CircleDollarSign, Activity, Server

interface TournamentInvestmentPoolCardProps {
  poolState: PoolState;
}

const MetricItem = ({ icon: Icon, label, value, currency }: { icon: React.ElementType, label: string, value: string | number, currency?: string }) => (
  <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
    <div className="flex items-center text-sm text-muted-foreground">
      <Icon className="h-4 w-4 mr-2" />
      <span>{label}</span>
    </div>
    <span className="font-semibold text-sm text-foreground">
      {typeof value === 'number' ? value.toLocaleString() : value}
      {currency && <span className="ml-1 text-xs text-muted-foreground">{currency}</span>}
    </span>
  </div>
);

export function TournamentInvestmentPoolCard({ poolState }: TournamentInvestmentPoolCardProps) {
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-primary" />
          <CardTitle className="font-headline text-lg">Tournament Investment Pool</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Overview of the primary pool for funding tournament entries.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-sm pt-2">
        <MetricItem
          icon={CircleDollarSign}
          label="Total Deposits"
          value={`$${poolState.totalDeposits.toLocaleString()}`}
        />
        <MetricItem
          icon={Server}
          label="Available Liquidity"
          value={`$${poolState.availableLiquidity.toLocaleString()}`}
        />
        <MetricItem
          icon={Activity}
          label="Active Tournaments Funded"
          value={poolState.activeTournamentsFunded.toLocaleString()}
        />
        <MetricItem
          icon={TrendingUp}
          label="Total Returns Generated"
          value={`$${poolState.totalReturnsGenerated.toLocaleString()}`}
        />
         <MetricItem
          icon={Layers}
          label="Pending Withdrawals"
          value={`$${poolState.pendingWithdrawals.toLocaleString()}`}
        />
      </CardContent>
    </Card>
  );
}
