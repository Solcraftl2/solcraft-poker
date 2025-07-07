'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  Trophy,
  Target,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Award,
  Zap,
  Eye
} from 'lucide-react';

interface PerformanceMetrics {
  totalTournaments: number;
  tournamentsWon: number;
  totalWinnings: number;
  totalBuyIns: number;
  roi: number;
  averageFinish: number;
  bestFinish: number;
  winRate: number;
}

interface TournamentResult {
  id: string;
  name: string;
  date: string;
  buyIn: number;
  position: number;
  totalPlayers: number;
  winnings: number;
  roi: number;
}

interface ChartData {
  date: string;
  winnings: number;
  buyIns: number;
  roi: number;
  tournaments: number;
}

interface PositionDistribution {
  range: string;
  count: number;
  percentage: number;
  color: string;
}

const mockPerformanceMetrics: PerformanceMetrics = {
  totalTournaments: 45,
  tournamentsWon: 3,
  totalWinnings: 2850,
  totalBuyIns: 1200,
  roi: 137.5,
  averageFinish: 15.2,
  bestFinish: 1,
  winRate: 6.7
};

const mockTournamentResults: TournamentResult[] = [
  {
    id: '1',
    name: 'Daily Championship',
    date: '2024-01-15',
    buyIn: 50,
    position: 1,
    totalPlayers: 100,
    winnings: 1500,
    roi: 2900
  },
  {
    id: '2',
    name: 'Turbo Bounty',
    date: '2024-01-14',
    buyIn: 25,
    position: 8,
    totalPlayers: 200,
    winnings: 125,
    roi: 400
  },
  {
    id: '3',
    name: 'High Roller',
    date: '2024-01-13',
    buyIn: 100,
    position: 25,
    totalPlayers: 50,
    winnings: 0,
    roi: -100
  },
  {
    id: '4',
    name: 'Freeroll',
    date: '2024-01-12',
    buyIn: 0,
    position: 5,
    totalPlayers: 500,
    winnings: 50,
    roi: 0
  },
  {
    id: '5',
    name: 'Weekly Special',
    date: '2024-01-11',
    buyIn: 75,
    position: 2,
    totalPlayers: 150,
    winnings: 900,
    roi: 1100
  }
];

const mockChartData: ChartData[] = [
  { date: '2024-01-01', winnings: 0, buyIns: 50, roi: -100, tournaments: 2 },
  { date: '2024-01-02', winnings: 125, buyIns: 75, roi: 66.7, tournaments: 3 },
  { date: '2024-01-03', winnings: 300, buyIns: 100, roi: 200, tournaments: 4 },
  { date: '2024-01-04', winnings: 250, buyIns: 125, roi: 100, tournaments: 5 },
  { date: '2024-01-05', winnings: 500, buyIns: 150, roi: 233.3, tournaments: 6 },
  { date: '2024-01-06', winnings: 750, buyIns: 200, roi: 275, tournaments: 8 },
  { date: '2024-01-07', winnings: 1200, buyIns: 250, roi: 380, tournaments: 10 }
];

const mockPositionDistribution: PositionDistribution[] = [
  { range: '1st Place', count: 3, percentage: 6.7, color: '#FFD700' },
  { range: '2nd-3rd', count: 4, percentage: 8.9, color: '#C0C0C0' },
  { range: '4th-10th', count: 8, percentage: 17.8, color: '#CD7F32' },
  { range: '11th-25th', count: 12, percentage: 26.7, color: '#4F46E5' },
  { range: '26th-50th', count: 10, percentage: 22.2, color: '#06B6D4' },
  { range: '51st+', count: 8, percentage: 17.8, color: '#EF4444' }
];

function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  format = 'number',
  trend 
}: {
  title: string;
  value: number;
  change?: number;
  icon: React.ElementType;
  format?: 'number' | 'currency' | 'percentage';
  trend?: 'up' | 'down' | 'neutral';
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{title}</span>
          </div>
          {getTrendIcon()}
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">{formatValue(value)}</p>
          {change !== undefined && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}% from last period
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TournamentResultsTable({ results }: { results: TournamentResult[] }) {
  return (
    <div className="space-y-2">
      {results.map((result) => (
        <Card key={result.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <Badge 
                  variant={result.position <= 3 ? 'default' : 'secondary'}
                  className={
                    result.position === 1 ? 'bg-yellow-500' :
                    result.position === 2 ? 'bg-gray-400' :
                    result.position === 3 ? 'bg-amber-600' : ''
                  }
                >
                  #{result.position}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  of {result.totalPlayers}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold">{result.name}</h3>
                <p className="text-sm text-muted-foreground">{result.date}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Buy-in</p>
                  <p className="font-medium">${result.buyIn}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Winnings</p>
                  <p className="font-medium">${result.winnings}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ROI</p>
                  <p className={`font-medium ${result.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.roi >= 0 ? '+' : ''}{result.roi.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedTab, setSelectedTab] = useState('overview');

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Analytics</h1>
          <p className="text-muted-foreground">
            Detailed insights into your poker performance and statistics
          </p>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
            <SelectItem value="1y">1 Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Winnings"
          value={mockPerformanceMetrics.totalWinnings}
          change={15.2}
          icon={DollarSign}
          format="currency"
          trend="up"
        />
        <MetricCard
          title="ROI"
          value={mockPerformanceMetrics.roi}
          change={-2.1}
          icon={TrendingUp}
          format="percentage"
          trend="down"
        />
        <MetricCard
          title="Tournaments Played"
          value={mockPerformanceMetrics.totalTournaments}
          change={8.3}
          icon={Trophy}
          trend="up"
        />
        <MetricCard
          title="Win Rate"
          value={mockPerformanceMetrics.winRate}
          change={1.2}
          icon={Target}
          format="percentage"
          trend="up"
        />
      </div>

      {/* Main Analytics */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Winnings Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="winnings" 
                    stackId="1"
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                    name="Winnings"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="buyIns" 
                    stackId="2"
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.6}
                    name="Buy-ins"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Position Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Finish Position Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={mockPositionDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, percentage }) => `${range}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {mockPositionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Key Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Finish</span>
                  <span className="font-semibold">{mockPerformanceMetrics.averageFinish}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Best Finish</span>
                  <span className="font-semibold">#{mockPerformanceMetrics.bestFinish}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tournaments Won</span>
                  <span className="font-semibold">{mockPerformanceMetrics.tournamentsWon}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Buy-ins</span>
                  <span className="font-semibold">${mockPerformanceMetrics.totalBuyIns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net Profit</span>
                  <span className="font-semibold text-green-600">
                    ${mockPerformanceMetrics.totalWinnings - mockPerformanceMetrics.totalBuyIns}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                ROI Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="roi" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="ROI %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tournaments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Recent Tournament Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TournamentResultsTable results={mockTournamentResults} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-400">Strong Performance</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your ROI is 37% above average for similar players
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-400">Consistency</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    You've cashed in 45% of tournaments - excellent consistency
                  </p>
                </div>
                
                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-orange-800 dark:text-orange-400">Opportunity</span>
                  </div>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Consider playing higher buy-in tournaments to maximize ROI
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Focus on Mid-Stakes</p>
                    <p className="text-sm text-muted-foreground">
                      Your best ROI comes from $25-$75 buy-in tournaments
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Tournament Selection</p>
                    <p className="text-sm text-muted-foreground">
                      Avoid tournaments with 200+ players for better ROI
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Bankroll Management</p>
                    <p className="text-sm text-muted-foreground">
                      Consider increasing stakes gradually based on your win rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

