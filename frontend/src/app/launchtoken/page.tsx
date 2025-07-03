
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListFilter, Search, Rocket, AlertTriangle, LayoutGrid } from "lucide-react";
import { mockTokenLaunches } from '@/lib/mock-data';
import type { TokenLaunch } from '@/lib/types';
import { TokenLaunchCard } from '@/components/launchtoken/token-launch-card';

export default function LaunchTokenPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // TODO: Implement actual filtering logic based on searchTerm, statusFilter, categoryFilter
  const featuredLaunches = mockTokenLaunches.filter(launch => launch.isFeatured && (launch.stage === 'Live' || launch.stage === 'Upcoming')).slice(0, 2);
  const liveLaunches = mockTokenLaunches.filter(launch => launch.stage === 'Live' && !launch.isFeatured);
  const upcomingLaunches = mockTokenLaunches.filter(launch => launch.stage === 'Upcoming' && !launch.isFeatured);
  const pastLaunches = mockTokenLaunches.filter(launch => launch.stage === 'Ended');

  const allCategories = Array.from(new Set(mockTokenLaunches.map(l => l.category).filter(Boolean))) as string[];


  return (
    <>
      <PageHeader
        title="Launchpad"
        description="Discover and participate in new token launches on SolCraft."
      />

      {/* Banner Image */}
      <div className="mb-8 rounded-lg overflow-hidden shadow-xl aspect-[16/5] max-h-[300px] relative">
        <Image
          src="https://placehold.co/1200x375.png"
          alt="SolCraft Launchpad Banner"
          fill
          className="object-cover"
          priority
          data-ai-hint="rocket launch space"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
          <Rocket className="w-16 h-16 text-primary mb-4 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-white">Ignite Your Portfolio</h2>
          <p className="text-lg text-gray-200 mt-2 max-w-2xl">
            Be the first to invest in groundbreaking projects. SolCraft Launchpad offers early access to curated token sales, vetted for quality and potential.
          </p>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="mb-8 shadow-md">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-2">
              <label htmlFor="search-launch" className="block text-sm font-medium text-muted-foreground mb-1">Search by Name or Ticker</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="search-launch" placeholder="e.g., NovaNet or NNAI" className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Live">Live</SelectItem>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Ended">Ended</SelectItem>
                  <SelectItem value="TBA">TBA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* <Button className="w-full lg:w-auto h-10">
              <ListFilter className="mr-2 h-4 w-4" /> Apply
            </Button> */}
          </div>
        </CardContent>
      </Card>

      {/* Featured Launches */}
      {featuredLaunches.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-headline font-semibold mb-4 pb-2 border-b border-border">Featured Launches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredLaunches.map((launch) => (
              <TokenLaunchCard key={launch.id} launch={launch} />
            ))}
          </div>
        </section>
      )}

      {/* Tabs for different launch stages */}
      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 h-12">
          <TabsTrigger value="live" className="text-base">Live Sales ({liveLaunches.length})</TabsTrigger>
          <TabsTrigger value="upcoming" className="text-base">Upcoming ({upcomingLaunches.length})</TabsTrigger>
          <TabsTrigger value="past" className="text-base">Past Launches ({pastLaunches.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="live">
          {liveLaunches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveLaunches.map((launch) => <TokenLaunchCard key={launch.id} launch={launch} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">
              <Rocket className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg">No live sales at the moment.</p>
              <p className="text-sm">Check the "Upcoming" tab or subscribe for notifications!</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="upcoming">
          {upcomingLaunches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingLaunches.map((launch) => <TokenLaunchCard key={launch.id} launch={launch} />)}
            </div>
          ) : (
             <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">
              <LayoutGrid className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg">No upcoming launches scheduled right now.</p>
              <p className="text-sm">Exciting projects are always in the pipeline. Stay tuned!</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="past">
          {pastLaunches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastLaunches.map((launch) => <TokenLaunchCard key={launch.id} launch={launch} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">
              <AlertTriangle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg">No past launch data available yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
