
'use client';

import { useState } from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StakingSummaryCard } from "@/components/staking/staking-summary-card";
import { StakingPoolCard } from "@/components/staking/staking-pool-card";
import { mockStakingSummary, mockStakingPools } from "@/lib/mock-data";
import type { StakingPool } from '@/lib/types';
import { ListFilter, Search, Database, AlertTriangle, BarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StakingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [assetFilter, setAssetFilter] = useState('all');
  const [apySort, setApySort] = useState('desc');

  // Placeholder for filtering and sorting
  const filteredAndSortedPools = mockStakingPools
    .filter(pool => {
      if (assetFilter !== 'all' && pool.assetTicker.toLowerCase() !== assetFilter.toLowerCase()) {
        return false;
      }
      if (searchTerm && !pool.assetName.toLowerCase().includes(searchTerm.toLowerCase()) && !pool.assetTicker.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (apySort === 'desc') {
        return (typeof b.apy === 'number' ? b.apy : 0) - (typeof a.apy === 'number' ? a.apy : 0);
      }
      return (typeof a.apy === 'number' ? a.apy : 0) - (typeof b.apy === 'number' ? b.apy : 0);
    });
  
  const allAssets = Array.from(new Set(mockStakingPools.map(p => p.assetTicker)));

  return (
    <>
      <PageHeader
        title="Staking Center"
        description="Grow your crypto assets by staking in various pools. Earn passive income with competitive APYs."
      />

      <StakingSummaryCard summary={mockStakingSummary} />

      <Card className="mt-8 mb-8 shadow-md">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-2">
              <label htmlFor="search-staking" className="block text-sm font-medium text-muted-foreground mb-1">Search by Asset Name or Ticker</label>
               <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="search-staking" placeholder="e.g., Solana or SOL" className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div>
              <label htmlFor="asset-filter" className="block text-sm font-medium text-muted-foreground mb-1">Filter by Asset</label>
              <Select value={assetFilter} onValueChange={setAssetFilter}>
                <SelectTrigger id="asset-filter">
                  <SelectValue placeholder="All Assets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assets</SelectItem>
                  {allAssets.map(asset => <SelectItem key={asset} value={asset}>{asset}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="apy-sort" className="block text-sm font-medium text-muted-foreground mb-1">Sort by APY</label>
              <Select value={apySort} onValueChange={setApySort}>
                <SelectTrigger id="apy-sort">
                  <SelectValue placeholder="Highest APY" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Highest APY First</SelectItem>
                  <SelectItem value="asc">Lowest APY First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* <Button className="w-full lg:w-auto h-10">
              <ListFilter className="mr-2 h-4 w-4" /> Apply
            </Button> */}
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4 pb-2 border-b border-border">Available Staking Pools</h2>
        {filteredAndSortedPools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedPools.map((pool) => (
              <StakingPoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">
            <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg">No staking pools match your criteria.</p>
            <p className="text-sm">Try adjusting your filters or check back later for new pools.</p>
          </div>
        )}
      </section>

      <Card className="mt-10 bg-muted/30 border-primary/20">
        <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                Staking Risks & Considerations
            </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Staking involves risks, including but not limited to smart contract vulnerabilities, market volatility, impermanent loss (for LP tokens), and slashing penalties. APYs are variable and not guaranteed.</p>
            <p>Always do your own research (DYOR) before staking your assets. Understand the lock-up periods and any associated fees. SolCraft may aggregate third-party pools and is not responsible for their performance or security.</p>
        </CardContent>
      </Card>
    </>
  );
}

    
