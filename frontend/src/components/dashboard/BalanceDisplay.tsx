"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useBalance } from '@/hooks/useBalance';

interface BalanceDisplayProps {
  className?: string;
}

export function BalanceDisplay({ className }: BalanceDisplayProps) {
  const { toast } = useToast();
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => setUid(user ? user.uid : null));
    return () => unsub();
  }, []);

  const { data, isLoading, error } = useBalance(uid ?? undefined);

  useEffect(() => {
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    }
  }, [error, toast]);

  const balance = data?.balance ?? { amount: 0, currency: 'USD' };
  const walletAddress = data?.walletAddress ?? 'N/A';

  const handleCopyAddress = () => {
    if (walletAddress && walletAddress !== 'N/A') {
      navigator.clipboard.writeText(walletAddress).then(() => {
        toast({ title: 'Wallet Address Copied!', description: walletAddress });
      }).catch(() => {
        toast({ title: 'Failed to copy', description: 'Could not copy address to clipboard.', variant: 'destructive' });
      });
    } else {
      toast({ title: 'No Address', description: 'Wallet address not available to copy.' });
    }
  };

  if (isLoading || !uid) {
    return (
      <Card className={cn(className)} style={{ minHeight: '160px' }}>
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase text-muted-foreground">My Balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-4 w-40 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)} style={{ minHeight: '160px' }}>
      <CardHeader>
        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">My Balance</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-4xl font-bold text-foreground mb-2">
          ${balance.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <span className="text-lg ml-1 text-muted-foreground">{balance.currency}</span>
        </p>
        <div className="flex items-center justify-center text-xs text-muted-foreground">
          <span>
            Wallet: {walletAddress.length > 20 ? `${walletAddress.substring(0,6)}...${walletAddress.slice(-4)}` : walletAddress}
          </span>
          {walletAddress !== 'N/A' && (
            <Button variant="ghost" size="icon" className="ml-1 h-6 w-6" onClick={handleCopyAddress}>
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
