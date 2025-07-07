"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FigmaPortfolioPerformanceChartProps {
  data: { name: string; value: number }[];
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-card border border-border rounded-md shadow-lg">
        <p className="label font-medium text-card-foreground">{`${label}`}</p>
        <p className="intro" style={{ color: 'hsl(var(--accent))' }}>{`Value : ${payload[0].value?.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

export function FigmaPortfolioPerformanceChart({ data: initialData, className }: FigmaPortfolioPerformanceChartProps) {
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | 'AllTime'>('7D');
  
  const chartData = timeframe === '7D' ? initialData.slice(-7) : 
                    timeframe === '30D' ? initialData.slice(-30) : 
                    initialData;

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Portfolio Performance</CardTitle>
        <div className="flex items-center gap-1">
          {(['7D', '30D', 'All Time'] as const).map((tfLabel) => {
            const tfValue = tfLabel === 'All Time' ? 'AllTime' : tfLabel;
            return (
              <Button
                key={tfValue}
                variant={timeframe === tfValue ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(tfValue)}
                className={cn(
                  "px-2 py-1 h-7 text-xs",
                  timeframe === tfValue ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                {tfLabel}
              </Button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -30, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValuePerformance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8} 
                fontSize={10}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                tickFormatter={(value) => `${value}`}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={10}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--accent) / 0.1)" }} />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorValuePerformance)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
