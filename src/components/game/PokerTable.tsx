'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Clock, 
  DollarSign, 
  Trophy,
  Heart,
  Diamond,
  Club,
  Spade
} from 'lucide-react';

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

interface PokerTableProps {
  tournamentId: string;
  players: Player[];
  currentPlayer?: string;
  pot: number;
  communityCards: PlayingCard[];
  gamePhase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  timeLeft?: number;
  onAction?: (action: string, amount?: number) => void;
}

const suitIcons = {
  hearts: Heart,
  diamonds: Diamond,
  clubs: Club,
  spades: Spade
};

const suitColors = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-black',
  spades: 'text-black'
};

function PlayingCardComponent({ card }: { card: PlayingCard }) {
  const SuitIcon = suitIcons[card.suit];
  
  if (!card.faceUp) {
    return (
      <div className="w-12 h-16 bg-blue-600 border border-blue-700 rounded-lg flex items-center justify-center">
        <div className="w-8 h-10 bg-blue-800 rounded border border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-12 h-16 bg-white border border-gray-300 rounded-lg flex flex-col items-center justify-center shadow-sm">
      <span className={`text-xs font-bold ${suitColors[card.suit]}`}>
        {card.rank}
      </span>
      <SuitIcon className={`w-4 h-4 ${suitColors[card.suit]}`} />
    </div>
  );
}

function PlayerSeat({ player, isCurrentPlayer }: { player: Player; isCurrentPlayer: boolean }) {
  return (
    <div className={`relative p-3 rounded-lg border-2 transition-all ${
      isCurrentPlayer 
        ? 'border-green-400 bg-green-50 dark:bg-green-950/20' 
        : player.isActive 
          ? 'border-blue-200 bg-blue-50 dark:bg-blue-950/20'
          : 'border-gray-200 bg-gray-50 dark:bg-gray-950/20 opacity-60'
    }`}>
      {/* Player badges */}
      <div className="absolute -top-2 left-2 flex gap-1">
        {player.isDealer && (
          <Badge variant="secondary" className="text-xs px-1 py-0">D</Badge>
        )}
        {player.isSmallBlind && (
          <Badge variant="outline" className="text-xs px-1 py-0">SB</Badge>
        )}
        {player.isBigBlind && (
          <Badge variant="outline" className="text-xs px-1 py-0">BB</Badge>
        )}
      </div>

      {/* Player info */}
      <div className="text-center space-y-1">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto">
          {player.name.charAt(0).toUpperCase()}
        </div>
        <p className="text-sm font-medium truncate">{player.name}</p>
        <p className="text-xs text-muted-foreground">{player.chips.toLocaleString()} chips</p>
        
        {/* Current bet */}
        {player.currentBet > 0 && (
          <Badge variant="default" className="text-xs">
            Bet: {player.currentBet}
          </Badge>
        )}
        
        {/* Player status */}
        {player.isFolded && (
          <Badge variant="destructive" className="text-xs">Folded</Badge>
        )}
      </div>

      {/* Player cards */}
      {player.cards && player.cards.length > 0 && (
        <div className="flex gap-1 justify-center mt-2">
          {player.cards.map((card, index) => (
            <PlayingCardComponent key={index} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PokerTable({
  tournamentId,
  players,
  currentPlayer,
  pot,
  communityCards,
  gamePhase,
  timeLeft,
  onAction
}: PokerTableProps) {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [betAmount, setBetAmount] = useState<number>(0);

  const currentPlayerData = players.find(p => p.id === currentPlayer);
  const isMyTurn = currentPlayerData?.isActive && currentPlayer;

  const handleAction = (action: string, amount?: number) => {
    if (onAction) {
      onAction(action, amount);
    }
    setSelectedAction('');
    setBetAmount(0);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Game info header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg">
        <div className="flex items-center gap-4">
          <Trophy className="w-6 h-6" />
          <div>
            <h2 className="text-lg font-bold">Tournament #{tournamentId}</h2>
            <p className="text-sm opacity-90">Phase: {gamePhase.toUpperCase()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-sm opacity-90">Pot</p>
            <p className="text-xl font-bold">{pot.toLocaleString()}</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm opacity-90">Players</p>
            <p className="text-xl font-bold">{players.filter(p => !p.isFolded).length}/{players.length}</p>
          </div>
          
          {timeLeft && (
            <div className="text-center">
              <p className="text-sm opacity-90">Time Left</p>
              <p className="text-xl font-bold">{timeLeft}s</p>
            </div>
          )}
        </div>
      </div>

      {/* Main table area */}
      <Card className="relative">
        <CardContent className="p-8">
          {/* Table background */}
          <div className="absolute inset-4 bg-gradient-to-br from-green-600 to-green-700 rounded-full opacity-20"></div>
          
          {/* Community cards area */}
          <div className="relative z-10 text-center mb-8">
            <h3 className="text-lg font-semibold mb-4">Community Cards</h3>
            <div className="flex gap-2 justify-center">
              {communityCards.map((card, index) => (
                <PlayingCardComponent key={index} card={card} />
              ))}
              {/* Placeholder cards */}
              {Array.from({ length: 5 - communityCards.length }).map((_, index) => (
                <div key={`placeholder-${index}`} className="w-12 h-16 border-2 border-dashed border-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>

          {/* Players arranged around the table */}
          <div className="relative">
            {/* Top players */}
            <div className="flex justify-center gap-4 mb-8">
              {players.slice(0, 3).map((player) => (
                <PlayerSeat 
                  key={player.id} 
                  player={player} 
                  isCurrentPlayer={player.id === currentPlayer}
                />
              ))}
            </div>

            {/* Side players */}
            <div className="flex justify-between items-center mb-8">
              {players.slice(3, 4).map((player) => (
                <PlayerSeat 
                  key={player.id} 
                  player={player} 
                  isCurrentPlayer={player.id === currentPlayer}
                />
              ))}
              
              {players.slice(4, 5).map((player) => (
                <PlayerSeat 
                  key={player.id} 
                  player={player} 
                  isCurrentPlayer={player.id === currentPlayer}
                />
              ))}
            </div>

            {/* Bottom players */}
            <div className="flex justify-center gap-4">
              {players.slice(5, 8).map((player) => (
                <PlayerSeat 
                  key={player.id} 
                  player={player} 
                  isCurrentPlayer={player.id === currentPlayer}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      {isMyTurn && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="destructive"
                  onClick={() => handleAction('fold')}
                >
                  Fold
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleAction('check')}
                >
                  Check
                </Button>
                <Button 
                  variant="default"
                  onClick={() => handleAction('call')}
                >
                  Call
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  placeholder="Bet amount"
                  className="px-3 py-2 border rounded-md w-32"
                  min="0"
                  max={currentPlayerData?.chips || 0}
                />
                <Button 
                  onClick={() => handleAction('bet', betAmount)}
                  disabled={betAmount <= 0}
                >
                  Bet
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleAction('all-in')}
                >
                  All In
                </Button>
              </div>
            </div>
            
            {timeLeft && (
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Time to act</span>
                  <span>{timeLeft}s</span>
                </div>
                <Progress value={(timeLeft / 30) * 100} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

