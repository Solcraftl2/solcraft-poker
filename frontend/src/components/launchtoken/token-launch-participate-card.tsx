
'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { TokenLaunch } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Target } from "lucide-react";
import { formatDistanceToNowStrict, parseISO } from "date-fns";

interface TokenLaunchParticipateCardProps {
  launch: TokenLaunch;
}

export function TokenLaunchParticipateCard({ launch }: TokenLaunchParticipateCardProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const progressPercentage = launch.targetRaise > 0 ? (launch.raisedAmount / launch.targetRaise) * 100 : 0;
  const tokenAmount = amount && launch.tokenPrice > 0 ? (parseFloat(amount) / launch.tokenPrice) : 0;

  const getTimeRemaining = () => {
    if (launch.stage === 'Live' && launch.endDate) {
      try {
        return `${formatDistanceToNowStrict(parseISO(launch.endDate))} left`;
      } catch (e) {
        return "ending soon";
      }
    }
    if (launch.stage === 'Upcoming' && launch.startDate) {
      try {
        return `Starts in ${formatDistanceToNowStrict(parseISO(launch.startDate))}`;
      } catch (e) {
        return "starting soon";
      }
    }
    return null;
  };

  const timeRemaining = getTimeRemaining();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount to contribute.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Contribution Submitted!",
        description: `Your contribution of $${amount} for ${tokenAmount.toLocaleString()} ${launch.ticker} has been submitted.`
      });
      setAmount('');
    }, 2000);
  };
  
  const isDisabled = launch.stage !== 'Live' || isProcessing;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">{timeRemaining || `Sale is ${launch.stage}`}</CardTitle>
        <CardDescription>Contribute USDC to participate in the launch.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>${launch.raisedAmount.toLocaleString()} / ${launch.targetRaise.toLocaleString()}</span>
            </div>
            <Progress value={progressPercentage} className="mt-1 h-3" />
            <p className="text-xs text-right text-muted-foreground mt-1">{progressPercentage.toFixed(2)}% funded</p>
          </div>
          <Separator />
           <div className="space-y-2">
            <Label htmlFor="contribution-amount">Your Contribution (USDC)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="contribution-amount"
                type="number"
                placeholder="0.00"
                className="pl-7"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isDisabled}
              />
            </div>
          </div>
          <div className="text-sm p-3 bg-muted/50 rounded-md">
            <div className="flex justify-between">
                <span>You will receive (approx.):</span>
                <span className="font-medium text-foreground">{tokenAmount > 0 ? tokenAmount.toLocaleString() : '0'} ${launch.ticker}</span>
            </div>
             <div className="flex justify-between text-xs mt-1">
                <span>Your USDC balance:</span>
                <span className="text-foreground">$5,432.10</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isDisabled}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Target className="mr-2 h-4 w-4" />}
            Contribute
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
