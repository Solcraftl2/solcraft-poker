'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Trophy, 
  Users, 
  Clock, 
  DollarSign, 
  Plus,
  Search,
  Filter,
  Star,
  Zap
} from 'lucide-react';
import { useSolcraftWallet } from '@/hooks/useSolcraftWallet';
import { toast } from 'sonner';

interface Tournament {
  id: string;
  name: string;
  buyIn: number;
  guaranteedPrize: number;
  currentPlayers: number;
  maxPlayers: number;
  startTime: Date;
  status: 'upcoming' | 'registering' | 'running' | 'finished';
  blindStructure: string;
  gameType: 'texas-holdem' | 'omaha' | 'seven-card-stud';
  speed: 'slow' | 'normal' | 'turbo' | 'hyper-turbo';
  isFeatured?: boolean;
}

interface TournamentLobbyProps {
  onJoinTournament?: (tournamentId: string) => void;
  onCreateTournament?: (tournament: Partial<Tournament>) => void;
}

const mockTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Daily Freeroll',
    buyIn: 0,
    guaranteedPrize: 1000,
    currentPlayers: 45,
    maxPlayers: 100,
    startTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    status: 'registering',
    blindStructure: '10/20',
    gameType: 'texas-holdem',
    speed: 'normal',
    isFeatured: true
  },
  {
    id: '2',
    name: 'High Roller Championship',
    buyIn: 100,
    guaranteedPrize: 50000,
    currentPlayers: 12,
    maxPlayers: 50,
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    status: 'registering',
    blindStructure: '25/50',
    gameType: 'texas-holdem',
    speed: 'slow',
    isFeatured: true
  },
  {
    id: '3',
    name: 'Turbo Bounty Hunter',
    buyIn: 25,
    guaranteedPrize: 5000,
    currentPlayers: 78,
    maxPlayers: 200,
    startTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    status: 'registering',
    blindStructure: '15/30',
    gameType: 'texas-holdem',
    speed: 'turbo'
  },
  {
    id: '4',
    name: 'Omaha Masters',
    buyIn: 50,
    guaranteedPrize: 10000,
    currentPlayers: 23,
    maxPlayers: 100,
    startTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    status: 'registering',
    blindStructure: '20/40',
    gameType: 'omaha',
    speed: 'normal'
  }
];

function TournamentCard({ tournament, onJoin }: { tournament: Tournament; onJoin: (id: string) => void }) {
  const { hasSufficientBalance, connected } = useSolcraftWallet();
  const canJoin = connected && hasSufficientBalance(tournament.buyIn);
  
  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'registering': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'running': return 'bg-orange-500';
      case 'finished': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getSpeedIcon = (speed: Tournament['speed']) => {
    switch (speed) {
      case 'turbo':
      case 'hyper-turbo':
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatTimeUntilStart = (startTime: Date) => {
    const now = new Date();
    const diff = startTime.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Card className={`relative overflow-hidden ${tournament.isFeatured ? 'ring-2 ring-yellow-400' : ''}`}>
      {tournament.isFeatured && (
        <div className="absolute top-2 right-2">
          <Star className="w-5 h-5 text-yellow-400 fill-current" />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {tournament.name}
              {getSpeedIcon(tournament.speed)}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {tournament.gameType.replace('-', ' ').toUpperCase()}
              </Badge>
              <Badge 
                variant="secondary" 
                className={`text-xs text-white ${getStatusColor(tournament.status)}`}
              >
                {tournament.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tournament stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-muted-foreground">Buy-in</p>
              <p className="font-semibold">
                {tournament.buyIn === 0 ? 'FREE' : `${tournament.buyIn} SOL`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <div>
              <p className="text-muted-foreground">Prize Pool</p>
              <p className="font-semibold">{tournament.guaranteedPrize.toLocaleString()} SOL</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-muted-foreground">Players</p>
              <p className="font-semibold">{tournament.currentPlayers}/{tournament.maxPlayers}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-muted-foreground">Starts in</p>
              <p className="font-semibold">{formatTimeUntilStart(tournament.startTime)}</p>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Registration</span>
            <span>{Math.round((tournament.currentPlayers / tournament.maxPlayers) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${(tournament.currentPlayers / tournament.maxPlayers) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Action button */}
        <Button 
          className="w-full"
          onClick={() => onJoin(tournament.id)}
          disabled={!canJoin || tournament.status !== 'registering'}
          variant={tournament.buyIn === 0 ? 'default' : 'outline'}
        >
          {!connected ? 'Connect Wallet' : 
           !hasSufficientBalance(tournament.buyIn) ? 'Insufficient Balance' :
           tournament.status !== 'registering' ? 'Registration Closed' :
           'Join Tournament'}
        </Button>
      </CardContent>
    </Card>
  );
}

function CreateTournamentDialog({ onCreateTournament }: { onCreateTournament: (tournament: Partial<Tournament>) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    buyIn: 0,
    guaranteedPrize: 0,
    maxPlayers: 100,
    gameType: 'texas-holdem' as Tournament['gameType'],
    speed: 'normal' as Tournament['speed']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTournament({
      ...formData,
      startTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      status: 'registering'
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Tournament
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Tournament</DialogTitle>
          <DialogDescription>
            Set up a new poker tournament for the community.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Tournament Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter tournament name"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buyIn">Buy-in (SOL)</Label>
              <Input
                id="buyIn"
                type="number"
                value={formData.buyIn}
                onChange={(e) => setFormData(prev => ({ ...prev, buyIn: Number(e.target.value) }))}
                min="0"
                step="0.1"
              />
            </div>
            
            <div>
              <Label htmlFor="maxPlayers">Max Players</Label>
              <Input
                id="maxPlayers"
                type="number"
                value={formData.maxPlayers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxPlayers: Number(e.target.value) }))}
                min="2"
                max="1000"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="guaranteedPrize">Guaranteed Prize (SOL)</Label>
            <Input
              id="guaranteedPrize"
              type="number"
              value={formData.guaranteedPrize}
              onChange={(e) => setFormData(prev => ({ ...prev, guaranteedPrize: Number(e.target.value) }))}
              min="0"
            />
          </div>
          
          <Button type="submit" className="w-full">
            Create Tournament
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TournamentLobby({ onJoinTournament, onCreateTournament }: TournamentLobbyProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const { joinTournament, connected } = useSolcraftWallet();

  const handleJoinTournament = async (tournamentId: string) => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;

    try {
      const result = await joinTournament(tournamentId, tournament.buyIn);
      if (result.success) {
        // Update tournament player count
        setTournaments(prev => prev.map(t => 
          t.id === tournamentId 
            ? { ...t, currentPlayers: t.currentPlayers + 1 }
            : t
        ));
        
        if (onJoinTournament) {
          onJoinTournament(tournamentId);
        }
      }
    } catch (error) {
      console.error('Error joining tournament:', error);
    }
  };

  const handleCreateTournament = (newTournament: Partial<Tournament>) => {
    const tournament: Tournament = {
      id: Date.now().toString(),
      currentPlayers: 0,
      blindStructure: '10/20',
      ...newTournament
    } as Tournament;
    
    setTournaments(prev => [tournament, ...prev]);
    toast.success('Tournament created successfully!');
    
    if (onCreateTournament) {
      onCreateTournament(tournament);
    }
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = selectedTab === 'all' || 
                      (selectedTab === 'free' && tournament.buyIn === 0) ||
                      (selectedTab === 'featured' && tournament.isFeatured) ||
                      (selectedTab === 'registering' && tournament.status === 'registering');
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tournament Lobby</h1>
          <p className="text-muted-foreground">Join exciting poker tournaments and win big!</p>
        </div>
        
        <CreateTournamentDialog onCreateTournament={handleCreateTournament} />
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tournaments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="free">Free</TabsTrigger>
            <TabsTrigger value="registering">Open</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tournament grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((tournament) => (
          <TournamentCard
            key={tournament.id}
            tournament={tournament}
            onJoin={handleJoinTournament}
          />
        ))}
      </div>

      {filteredTournaments.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tournaments found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

