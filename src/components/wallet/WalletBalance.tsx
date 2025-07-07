'use client';

import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  RefreshCw, 
  TrendingUp, 
  DollarSign,
  Coins
} from 'lucide-react';
import { toast } from 'sonner';

interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
  symbol: string;
  name: string;
}

interface WalletBalanceProps {
  className?: string;
  showRefresh?: boolean;
  compact?: boolean;
}

export function WalletBalance({ 
  className = '', 
  showRefresh = true,
  compact = false 
}: WalletBalanceProps) {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBalances = async () => {
    if (!publicKey || !connected) return;

    setLoading(true);
    try {
      // Fetch SOL balance
      const balance = await connection.getBalance(publicKey);
      setSolBalance(balance / LAMPORTS_PER_SOL);

      // Fetch token balances (simplified - in production you'd use a token list)
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      const tokens: TokenBalance[] = [];
      for (const account of tokenAccounts.value) {
        const tokenInfo = account.account.data.parsed.info;
        if (tokenInfo.tokenAmount.uiAmount > 0) {
          // This is a simplified version - in production you'd fetch token metadata
          tokens.push({
            mint: tokenInfo.mint,
            amount: tokenInfo.tokenAmount.uiAmount,
            decimals: tokenInfo.tokenAmount.decimals,
            symbol: 'TOKEN', // Would fetch from token registry
            name: 'Unknown Token' // Would fetch from token registry
          });
        }
      }
      setTokenBalances(tokens);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching balances:', error);
      toast.error('Failed to fetch wallet balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalances();
    } else {
      setSolBalance(null);
      setTokenBalances([]);
      setLastUpdated(null);
    }
  }, [connected, publicKey, connection]);

  if (!connected) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Connect wallet to view balance</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-purple-400" />
          <span className="font-medium">
            {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : '---'}
          </span>
        </div>
        {showRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchBalances}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Wallet Balance
        </CardTitle>
        {showRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchBalances}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* SOL Balance */}
          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">SOL</span>
              </div>
              <div>
                <p className="font-medium">Solana</p>
                <p className="text-sm text-muted-foreground">SOL</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">
                {solBalance !== null ? solBalance.toFixed(4) : '---'}
              </p>
              <p className="text-sm text-muted-foreground">SOL</p>
            </div>
          </div>

          {/* Token Balances */}
          {tokenBalances.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Token Balances</h4>
              {tokenBalances.map((token, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{token.symbol}</p>
                    <p className="text-xs text-muted-foreground">{token.name}</p>
                  </div>
                  <p className="font-medium">{token.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Last Updated */}
          {lastUpdated && (
            <p className="text-xs text-muted-foreground text-center">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

