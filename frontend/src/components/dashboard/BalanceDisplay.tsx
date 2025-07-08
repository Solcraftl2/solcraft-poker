"use client";

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBalance } from '@/hooks/useBalance';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BalanceDisplayProps {
  userId?: string;
  className?: string;
}

export function BalanceDisplay({ userId, className }: BalanceDisplayProps) {
  const { balance, loading, error } = useBalance(userId);
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    }
  }, [error, toast]);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
          Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        {loading ? (
          <Skeleton className="h-8 w-32 mx-auto" />
        ) : (
          <p className="text-4xl font-bold text-foreground">
            {balance
              ? `$${balance.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '$0'}
            <span className="text-lg ml-1 text-muted-foreground">{balance?.currency}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
