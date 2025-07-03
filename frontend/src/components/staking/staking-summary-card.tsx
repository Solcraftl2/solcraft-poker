
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { StakingSummary } from "@/lib/types";
import { DollarSign, TrendingUp, Layers, Percent, BarChart } from "lucide-react"; // Added BarChart for average APY

interface StakingSummaryCardProps {
  summary: StakingSummary;
}

const MetricDisplay = ({ icon: Icon, label, value, unit, valueClass }: { icon: LucideIcon, label: string, value: string | number, unit?: string, valueClass?: string }) => (
  <div className="flex-1 p-3 bg-muted/30 rounded-md border border-border/60 text-center min-w-[120px]">
    <Icon className="h-6 w-6 text-primary mx-auto mb-1.5" />
    <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
    <div className={`text-xl font-semibold text-foreground mt-0.5 ${valueClass || ''}`}>
      {typeof value === 'number' && (label.toLowerCase().includes('usd') || unit === '$') ? '$' : ''}
      {typeof value === 'number' ? value.toLocaleString(undefined, {maximumFractionDigits: 2}) : value}
      {typeof value === 'number' && unit && unit !== '$' ? <span className="text-sm">{unit}</span> : ''}
    </div>
  </div>
);


export function StakingSummaryCard({ summary }: StakingSummaryCardProps) {
  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
            <DollarSign className="mr-2 h-6 w-6 text-primary" />
            My Staking Overview
        </CardTitle>
        <CardDescription>Summary of your current staking activities and rewards.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 justify-around">
          <MetricDisplay
            icon={Layers}
            label="Total Staked"
            value={summary.totalStakedUSD}
            unit="$"
          />
          <MetricDisplay
            icon={TrendingUp}
            label="Rewards Earned"
            value={summary.totalRewardsEarnedUSD}
            unit="$"
            valueClass="text-green-500"
          />
          <MetricDisplay
            icon={Percent}
            label="Avg. APY"
            value={summary.averageAPY}
            unit="%"
          />
           <MetricDisplay
            icon={BarChart} // Using BarChart as a generic icon for "Active Stakes" count
            label="Active Stakes"
            value={summary.activeStakesCount}
          />
        </div>
      </CardContent>
    </Card>
  );
}

    