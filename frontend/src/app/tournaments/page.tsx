'use client';

import { useState, useEffect } from 'react';
import { TournamentCard } from "@/components/tournaments/tournament-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Filter, Trophy, Wifi, WifiOff } from 'lucide-react';

// Import API client for real data
import { apiClient, type Tournament } from "@/lib/api-client-real";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isApiConnected, setIsApiConnected] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [buyInFilter, setBuyInFilter] = useState('all');

  // Load tournaments from API
  useEffect(() => {
    const loadTournaments = async () => {
      try {
        setIsLoading(true);
        setApiError(null);

        // Test API connection
        const healthResponse = await apiClient.healthCheck();
        if (healthResponse.success) {
          setIsApiConnected(true);
        } else {
          setIsApiConnected(false);
          throw new Error('API health check failed');
        }

        // Load tournaments
        const response = await apiClient.getAllTournaments();
        if (response.success && response.data) {
          setTournaments(response.data.tournaments);
          setFilteredTournaments(response.data.tournaments);
          console.log('✅ Tournaments loaded:', response.data.tournaments.length);
        } else {
          throw new Error(response.error || 'Failed to load tournaments');
        }

      } catch (error) {
        console.error('Error loading tournaments:', error);
        setApiError(error instanceof Error ? error.message : 'Unknown error');
        setIsApiConnected(false);
        
        // Fallback to empty array
        setTournaments([]);
        setFilteredTournaments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTournaments();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = tournaments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tournament =>
        tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.organizer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tournament => tournament.status === statusFilter);
    }

    // Buy-in filter
    if (buyInFilter !== 'all') {
      switch (buyInFilter) {
        case 'free':
          filtered = filtered.filter(tournament => tournament.buy_in === 0);
          break;
        case 'low':
          filtered = filtered.filter(tournament => tournament.buy_in > 0 && tournament.buy_in <= 100);
          break;
        case 'medium':
          filtered = filtered.filter(tournament => tournament.buy_in > 100 && tournament.buy_in <= 500);
          break;
        case 'high':
          filtered = filtered.filter(tournament => tournament.buy_in > 500);
          break;
      }
    }

    setFilteredTournaments(filtered);
  }, [tournaments, searchTerm, statusFilter, buyInFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setBuyInFilter('all');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || buyInFilter !== 'all';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Browse Tournaments</h1>
        <p className="text-muted-foreground">Find exciting poker tournaments to invest in.</p>
      </div>

      {/* Hero Section */}
      <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="text-center py-12">
          <Trophy className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Find Your Next Big Win</h2>
          <p className="text-lg opacity-90">
            Explore a wide range of tournaments, from daily freerolls to high-stakes showdowns. 
            Analyze, invest, and win with SolCraft.
          </p>
        </CardContent>
      </Card>

      {/* API Status */}
      <Card className={`mb-6 ${isApiConnected ? 'border-green-200 bg-green-50' : 'border-destructive bg-destructive/10'}`}>
        <CardContent className="flex items-center space-x-2 p-4">
          {isApiConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700">
                ✅ Connected to SolCraft API - {tournaments.length} tournaments loaded
              </p>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">
                ❌ API Connection Issue: {apiError}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Tournaments</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Enter tournament name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="registration_open">Registration Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed_won">Completed</option>
              </select>
            </div>

            {/* Buy-in Filter */}
            <div className="space-y-2">
              <Label>Buy-in Range</Label>
              <select
                value={buyInFilter}
                onChange={(e) => setBuyInFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">Any Buy-in</option>
                <option value="free">Free ($0)</option>
                <option value="low">Low ($1-$100)</option>
                <option value="medium">Medium ($101-$500)</option>
                <option value="high">High ($500+)</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                {hasActiveFilters ? 'Clear Filters' : 'No Filters'}
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary">Search: {searchTerm}</Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary">Status: {statusFilter}</Badge>
              )}
              {buyInFilter !== 'all' && (
                <Badge variant="secondary">Buy-in: {buyInFilter}</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {filteredTournaments.length} Tournament{filteredTournaments.length !== 1 ? 's' : ''} Found
        </h3>
        {isApiConnected && (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Live Data
          </Badge>
        )}
      </div>

      {/* Tournament Grid */}
      {filteredTournaments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.tournament_id}
              tournament={{
                id: tournament.tournament_id.toString(),
                title: tournament.name,
                organizer: tournament.organizer,
                description: `Tournament with ${tournament.max_players} max players`,
                buyIn: tournament.buy_in,
                prizePool: tournament.prize_pool,
                startTime: new Date(tournament.start_time * 1000).toISOString(),
                maxPlayers: tournament.max_players,
                currentPlayers: tournament.current_players,
                status: tournament.status === 'registration_open' ? 'Upcoming' : 
                       tournament.status === 'in_progress' ? 'Live' : 'Finished',
                aiRisk: 'Medium'
              }}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No tournaments found</h3>
            <p className="text-muted-foreground mb-4">
              {apiError 
                ? 'Unable to load tournaments. Please try again later.'
                : hasActiveFilters 
                  ? 'Try adjusting your filters to see more results.'
                  : 'No tournaments are currently available.'
              }
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

