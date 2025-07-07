'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle, 
  Users, 
  Settings, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  Trophy,
  Clock,
  DollarSign
} from 'lucide-react';
import { PokerTable } from './PokerTable';
import { useSolcraftWallet } from '@/hooks/useSolcraftWallet';

interface Player {
  id: string;
  name: string;
  avatar?: string;
  chips: number;
  position: number;
  isActive: boolean;
  isFolded: boolean;
  currentBet: number;
  cards?: PlayingCard[];
  isDealer?: boolean;
  isSmallBlind?: boolean;
  isBigBlind?: boolean;
}

interface PlayingCard {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  faceUp: boolean;
}

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'action' | 'system';
}

interface TournamentInfo {
  id: string;
  name: string;
  buyIn: number;
  prizePool: number;
  playersRemaining: number;
  totalPlayers: number;
  blindLevel: number;
  nextBlindIncrease: Date;
  averageChips: number;
}

interface GameRoomProps {
  tournamentId: string;
  onLeaveRoom?: () => void;
}

const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'You',
    chips: 15000,
    position: 0,
    isActive: true,
    isFolded: false,
    currentBet: 0,
    cards: [
      { suit: 'hearts', rank: 'A', faceUp: true },
      { suit: 'spades', rank: 'K', faceUp: true }
    ],
    isDealer: false,
    isSmallBlind: false,
    isBigBlind: false
  },
  {
    id: '2',
    name: 'Alice',
    chips: 12500,
    position: 1,
    isActive: false,
    isFolded: false,
    currentBet: 100,
    isDealer: true,
    isSmallBlind: false,
    isBigBlind: false
  },
  {
    id: '3',
    name: 'Bob',
    chips: 8000,
    position: 2,
    isActive: false,
    isFolded: false,
    currentBet: 200,
    isDealer: false,
    isSmallBlind: true,
    isBigBlind: false
  },
  {
    id: '4',
    name: 'Charlie',
    chips: 20000,
    position: 3,
    isActive: false,
    isFolded: false,
    currentBet: 200,
    isDealer: false,
    isSmallBlind: false,
    isBigBlind: true
  },
  {
    id: '5',
    name: 'Diana',
    chips: 5500,
    position: 4,
    isActive: false,
    isFolded: true,
    currentBet: 0,
    isDealer: false,
    isSmallBlind: false,
    isBigBlind: false
  }
];

const mockCommunityCards: PlayingCard[] = [
  { suit: 'hearts', rank: '9', faceUp: true },
  { suit: 'diamonds', rank: 'J', faceUp: true },
  { suit: 'clubs', rank: 'Q', faceUp: true }
];

const mockTournamentInfo: TournamentInfo = {
  id: '1',
  name: 'Daily Championship',
  buyIn: 50,
  prizePool: 25000,
  playersRemaining: 45,
  totalPlayers: 100,
  blindLevel: 3,
  nextBlindIncrease: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
  averageChips: 11111
};

const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    playerId: 'system',
    playerName: 'System',
    message: 'Tournament started! Good luck everyone!',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    type: 'system'
  },
  {
    id: '2',
    playerId: '2',
    playerName: 'Alice',
    message: 'Good luck everyone!',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    type: 'chat'
  },
  {
    id: '3',
    playerId: '3',
    playerName: 'Bob',
    message: 'calls 200',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    type: 'action'
  },
  {
    id: '4',
    playerId: '4',
    playerName: 'Charlie',
    message: 'Nice hand!',
    timestamp: new Date(Date.now() - 1 * 60 * 1000),
    type: 'chat'
  }
];

function TournamentInfoPanel({ tournament }: { tournament: TournamentInfo }) {
  const [timeToNextBlind, setTimeToNextBlind] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = tournament.nextBlindIncrease.getTime() - now.getTime();
      
      if (diff > 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeToNextBlind(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeToNextBlind('00:00');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [tournament.nextBlindIncrease]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          {tournament.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Prize Pool</p>
            <p className="font-semibold text-lg">{tournament.prizePool.toLocaleString()} SOL</p>
          </div>
          <div>
            <p className="text-muted-foreground">Players Left</p>
            <p className="font-semibold text-lg">{tournament.playersRemaining}/{tournament.totalPlayers}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Blind Level</p>
            <p className="font-semibold">Level {tournament.blindLevel}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Next Increase</p>
            <p className="font-semibold text-orange-600">{timeToNextBlind}</p>
          </div>
        </div>
        
        <div>
          <p className="text-muted-foreground text-sm mb-1">Average Chips</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${Math.min((mockPlayers[0].chips / tournament.averageChips) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            You: {mockPlayers[0].chips.toLocaleString()} | Avg: {tournament.averageChips.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ChatPanel({ messages, onSendMessage }: { 
  messages: ChatMessage[]; 
  onSendMessage: (message: string) => void;
}) {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const getMessageStyle = (type: ChatMessage['type']) => {
    switch (type) {
      case 'system':
        return 'text-blue-600 font-medium';
      case 'action':
        return 'text-green-600 font-medium';
      default:
        return '';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 mb-4 h-64">
          <div className="space-y-2">
            {messages.map((message) => (
              <div key={message.id} className="text-sm">
                <span className={`font-medium ${getMessageStyle(message.type)}`}>
                  {message.playerName}:
                </span>
                <span className="ml-2">{message.message}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="sm">
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PlayersPanel({ players }: { players: Player[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          Players ({players.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {players
              .sort((a, b) => b.chips - a.chips)
              .map((player) => (
                <div key={player.id} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{player.name}</p>
                      <div className="flex gap-1">
                        {player.isDealer && <Badge variant="secondary" className="text-xs px-1 py-0">D</Badge>}
                        {player.isSmallBlind && <Badge variant="outline" className="text-xs px-1 py-0">SB</Badge>}
                        {player.isBigBlind && <Badge variant="outline" className="text-xs px-1 py-0">BB</Badge>}
                        {player.isFolded && <Badge variant="destructive" className="text-xs px-1 py-0">Folded</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{player.chips.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">chips</p>
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function GameRoom({ tournamentId, onLeaveRoom }: GameRoomProps) {
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [communityCards, setCommunityCards] = useState<PlayingCard[]>(mockCommunityCards);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [gamePhase, setGamePhase] = useState<'preflop' | 'flop' | 'turn' | 'river' | 'showdown'>('flop');
  const [pot, setPot] = useState(500);
  const [currentPlayer, setCurrentPlayer] = useState('1');
  const [timeLeft, setTimeLeft] = useState(25);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { connected } = useSolcraftWallet();

  const handlePlayerAction = (action: string, amount?: number) => {
    console.log(`Player action: ${action}`, amount);
    
    // Simulate game logic
    switch (action) {
      case 'fold':
        setPlayers(prev => prev.map(p => 
          p.id === currentPlayer ? { ...p, isFolded: true, isActive: false } : p
        ));
        break;
      case 'call':
        // Handle call logic
        break;
      case 'bet':
      case 'raise':
        if (amount) {
          setPot(prev => prev + amount);
          setPlayers(prev => prev.map(p => 
            p.id === currentPlayer ? { ...p, currentBet: amount, chips: p.chips - amount } : p
          ));
        }
        break;
      case 'all-in':
        const player = players.find(p => p.id === currentPlayer);
        if (player) {
          setPot(prev => prev + player.chips);
          setPlayers(prev => prev.map(p => 
            p.id === currentPlayer ? { ...p, currentBet: p.chips, chips: 0 } : p
          ));
        }
        break;
    }
    
    // Move to next player
    const nextPlayerIndex = (players.findIndex(p => p.id === currentPlayer) + 1) % players.length;
    setCurrentPlayer(players[nextPlayerIndex].id);
    setTimeLeft(30);
  };

  const handleSendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      playerId: '1',
      playerName: 'You',
      message,
      timestamp: new Date(),
      type: 'chat'
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && currentPlayer === '1') {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentPlayer === '1') {
      // Auto-fold when time runs out
      handlePlayerAction('fold');
    }
  }, [timeLeft, currentPlayer]);

  if (!connected) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-lg mb-4">Please connect your wallet to join the game</p>
              <Button onClick={onLeaveRoom}>Back to Lobby</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <div className="container mx-auto p-4 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onLeaveRoom}>
              Leave Table
            </Button>
            <h1 className="text-xl font-bold">Tournament #{tournamentId}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Main game area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <TournamentInfoPanel tournament={mockTournamentInfo} />
            <PlayersPanel players={players} />
          </div>

          {/* Game table */}
          <div className="lg:col-span-2">
            <PokerTable
              tournamentId={tournamentId}
              players={players}
              currentPlayer={currentPlayer}
              pot={pot}
              communityCards={communityCards}
              gamePhase={gamePhase}
              timeLeft={timeLeft}
              onAction={handlePlayerAction}
            />
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-1">
            <ChatPanel 
              messages={chatMessages}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

