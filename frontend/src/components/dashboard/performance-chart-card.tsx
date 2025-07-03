"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface PerformanceChartCardProps {
  data: { date: string; value: number }[];
}

const chartConfig = {
  value: {
    label: "Portfolio Value",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background border border-border rounded-md shadow-lg">
        <p className="label font-medium text-foreground">{`${label}`}</p>
        <p className="intro text-primary">{`Value : $${payload[0].value?.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};


export function PerformanceChartCard({ data }: PerformanceChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Portfolio Performance</CardTitle>
        <CardDescription>Monthly portfolio value over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8} 
            />
            <YAxis 
              tickFormatter={(value) => `$${value / 1000}k`}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
          </RechartsBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
