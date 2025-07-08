"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Users, 
  Coins, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp,
  Clock,
  Trophy,
  Zap
} from 'lucide-react';

import { useWallet } from '@/contexts/WalletContext';
import type { 
  PokerTable, 
  PlayerAccount, 
  PlayerAction,
  TransactionResult 
} from '@/lib/solcraft-sdk';

interface PokerGameProps {
  tableId?: string;
  onTableCreated?: (tableId: string) => void;
  onGameEnd?: (results: any) => void;
}

export function PokerGame({ tableId, onTableCreated, onGameEnd }: PokerGameProps) {
  const { 
    connected, 
    sdk, 
    walletAddress, 
    solBalance,
    createTable,
    joinTable 
  } = useWallet();

  // Game state
  const [table, setTable] = useState<PokerTable | null>(null);
  const [playerAccount, setPlayerAccount] = useState<PlayerAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [gamePhase, setGamePhase] = useState<'lobby' | 'playing' | 'finished'>('lobby');

  // Table creation form
  const [createTableForm, setCreateTableForm] = useState({
    maxPlayers: 6,
    buyInAmount: 0.1,
    smallBlind: 0.005,
    bigBlind: 0.01,
    ante: 0
  });

  // Betting form
  const [betAmount, setBetAmount] = useState(0);
  const [selectedAction, setSelectedAction] = useState<PlayerAction>('Check');

  /**
   * Load table data
   */
  const loadTableData = useCallback(async () => {
    if (!sdk || !tableId) return;

    try {
      const [tableData, playerData] = await Promise.all([
        sdk.getTable(tableId),
        walletAddress ? sdk.getPlayerAccount(tableId) : null
      ]);

      setTable(tableData);
      setPlayerAccount(playerData);

      if (tableData) {
        setGamePhase(
          tableData.status === 'Playing' ? 'playing' :
          tableData.status === 'Finished' ? 'finished' : 'lobby'
        );
      }
    } catch (error) {
      console.error('Error loading table data:', error);
      toast.error('Failed to load table data');
    }
  }, [sdk, tableId, walletAddress]);

  /**
   * Create new table
   */
  const handleCreateTable = async () => {
    if (!connected || !sdk) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!solBalance || solBalance < createTableForm.buyInAmount) {
      toast.error('Insufficient SOL balance');
      return;
    }

    setLoading(true);
    try {
      const result = await createTable(createTableForm);
      
      if (result.success && result.tableId) {
        toast.success('Table created successfully!');
        onTableCreated?.(result.tableId);
      } else {
        toast.error(result.error || 'Failed to create table');
      }
    } catch (error) {
      console.error('Error creating table:', error);
      toast.error('Failed to create table');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Join existing table
   */
  const handleJoinTable = async () => {
    if (!connected || !sdk || !tableId) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!table) {
      toast.error('Table not found');
      return;
    }

    if (!solBalance || solBalance < sdk.lamportsToSol(table.buyInAmount)) {
      toast.error('Insufficient SOL balance for buy-in');
      return;
    }

    setLoading(true);
    try {
      const result = await joinTable(tableId);
      
      if (result.success) {
        toast.success('Joined table successfully!');
        await loadTableData();
      } else {
        toast.error(result.error || 'Failed to join table');
      }
    } catch (error) {
      console.error('Error joining table:', error);
      toast.error('Failed to join table');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Place bet
   */
  const handlePlaceBet = async (action: PlayerAction, amount?: number) => {
    if (!connected || !sdk || !tableId) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!playerAccount || !playerAccount.isActive) {
      toast.error('You are not active in this game');
      return;
    }

    const betAmountSol = amount || betAmount;
    
    if (action !== 'Fold' && action !== 'Check') {
      if (betAmountSol <= 0) {
        toast.error('Invalid bet amount');
        return;
      }

      const playerChipsSol = sdk.lamportsToSol(playerAccount.chips);
      if (betAmountSol > playerChipsSol) {
        toast.error('Insufficient chips');
        return;
      }
    }

    setLoading(true);
    try {
      const result = await sdk.placeBet(tableId, betAmountSol, action);
      
      if (result.success) {
        toast.success(`${action} successful!`);
        await loadTableData();
        setBetAmount(0);
      } else {
        toast.error(result.error || `Failed to ${action.toLowerCase()}`);
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      toast.error(`Failed to ${action.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Quick bet actions
   */
  const quickActions = [
    { action: 'Fold' as PlayerAction, label: 'Fold', variant: 'destructive' as const },
    { action: 'Check' as PlayerAction, label: 'Check', variant: 'outline' as const },
    { action: 'Call' as PlayerAction, label: 'Call', variant: 'secondary' as const },
    { action: 'Raise' as PlayerAction, label: 'Raise', variant: 'default' as const },
  ];

  // Load data on mount and when tableId changes
  useEffect(() => {
    if (tableId) {
      loadTableData();
    }
  }, [tableId, loadTableData]);

  // Auto-refresh data during game
  useEffect(() => {
    if (gamePhase === 'playing' && tableId) {
      const interval = setInterval(loadTableData, 5000);
      return () => clearInterval(interval);
    }
  }, [gamePhase, tableId, loadTableData]);

  if (!connected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            SolCraft Poker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Connect your wallet to start playing poker
            </p>
            <Button>Connect Wallet</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Game Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              SolCraft Poker
              {table && (
                <Badge variant={
                  table.status === 'Playing' ? 'default' :
                  table.status === 'Waiting' ? 'secondary' : 'outline'
                }>
                  {table.status}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4" />
                {solBalance?.toFixed(4)} SOL
              </div>
              {table && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {table.currentPlayers}/{table.maxPlayers}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Create Table Form */}
      {!tableId && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Table</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxPlayers">Max Players</Label>
                <Input
                  id="maxPlayers"
                  type="number"
                  min="2"
                  max="9"
                  value={createTableForm.maxPlayers}
                  onChange={(e) => setCreateTableForm(prev => ({
                    ...prev,
                    maxPlayers: parseInt(e.target.value) || 2
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="buyIn">Buy-in (SOL)</Label>
                <Input
                  id="buyIn"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={createTableForm.buyInAmount}
                  onChange={(e) => setCreateTableForm(prev => ({
                    ...prev,
                    buyInAmount: parseFloat(e.target.value) || 0.001
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="smallBlind">Small Blind (SOL)</Label>
                <Input
                  id="smallBlind"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={createTableForm.smallBlind}
                  onChange={(e) => setCreateTableForm(prev => ({
                    ...prev,
                    smallBlind: parseFloat(e.target.value) || 0.001
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="bigBlind">Big Blind (SOL)</Label>
                <Input
                  id="bigBlind"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={createTableForm.bigBlind}
                  onChange={(e) => setCreateTableForm(prev => ({
                    ...prev,
                    bigBlind: parseFloat(e.target.value) || 0.001
                  }))}
                />
              </div>
            </div>
            <Button 
              onClick={handleCreateTable} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create Table'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table Info */}
      {table && (
        <Card>
          <CardHeader>
            <CardTitle>Table Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Buy-in</Label>
                <p className="text-lg font-semibold">
                  {sdk?.lamportsToSol(table.buyInAmount).toFixed(4)} SOL
                </p>
              </div>
              <div>
                <Label>Pot Size</Label>
                <p className="text-lg font-semibold">
                  {sdk?.lamportsToSol(table.potAmount).toFixed(4)} SOL
                </p>
              </div>
              <div>
                <Label>Small/Big Blind</Label>
                <p className="text-lg font-semibold">
                  {sdk?.lamportsToSol(table.blindStructure.smallBlind).toFixed(4)}/
                  {sdk?.lamportsToSol(table.blindStructure.bigBlind).toFixed(4)} SOL
                </p>
              </div>
              <div>
                <Label>Round</Label>
                <p className="text-lg font-semibold">
                  {table.currentRound}
                </p>
              </div>
            </div>

            {gamePhase === 'lobby' && !playerAccount && (
              <div className="mt-6">
                <Button 
                  onClick={handleJoinTable} 
                  disabled={loading || table.currentPlayers >= table.maxPlayers}
                  className="w-full"
                >
                  {loading ? 'Joining...' : 
                   table.currentPlayers >= table.maxPlayers ? 'Table Full' : 'Join Table'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Player Info */}
      {playerAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Your Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Position</Label>
                <p className="text-lg font-semibold">
                  {playerAccount.position + 1}
                </p>
              </div>
              <div>
                <Label>Chips</Label>
                <p className="text-lg font-semibold">
                  {sdk?.lamportsToSol(playerAccount.chips).toFixed(4)} SOL
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <Badge variant={playerAccount.isActive ? 'default' : 'secondary'}>
                  {playerAccount.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Actions */}
      {gamePhase === 'playing' && playerAccount?.isActive && (
        <Card>
          <CardHeader>
            <CardTitle>Your Turn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bet Amount Input */}
            <div>
              <Label htmlFor="betAmount">Bet Amount (SOL)</Label>
              <Input
                id="betAmount"
                type="number"
                step="0.001"
                min="0"
                max={sdk?.lamportsToSol(playerAccount.chips)}
                value={betAmount}
                onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                placeholder="Enter bet amount"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickActions.map(({ action, label, variant }) => (
                <Button
                  key={action}
                  variant={variant}
                  onClick={() => handlePlaceBet(action)}
                  disabled={loading}
                  className="w-full"
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* Custom Bet */}
            <Button
              onClick={() => handlePlaceBet('Bet', betAmount)}
              disabled={loading || betAmount <= 0}
              className="w-full"
              variant="outline"
            >
              Bet {betAmount.toFixed(4)} SOL
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Game Status */}
      {gamePhase === 'finished' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Game Finished
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-lg mb-4">
                The game has ended. Check the results above.
              </p>
              <Button onClick={() => window.location.reload()}>
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

