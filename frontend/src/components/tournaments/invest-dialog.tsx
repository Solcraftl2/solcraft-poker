
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InvestmentDetails {
  tournamentName: string;
  tournamentId: string;
  tierName: string;
  minInvestment?: number;
  maxInvestment?: number;
  tokenTicker: string;
}

interface InvestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  details: InvestmentDetails;
  onConfirm: (amount: number) => void;
  isProcessing: boolean;
}

export function InvestDialog({ open, onOpenChange, details, onConfirm, isProcessing }: InvestDialogProps) {
  const [amount, setAmount] = useState(details.minInvestment || 0);
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset amount when dialog details change
    setAmount(details.minInvestment || 0);
    setError('');
  }, [details]);

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setAmount(numValue);
      validate(numValue);
    } else if (value === '') {
      setAmount(0);
      setError('');
    }
  };
  
  const handleSliderChange = (value: number[]) => {
      setAmount(value[0]);
      validate(value[0]);
  }

  const validate = (value: number) => {
    if (details.minInvestment && value < details.minInvestment) {
        setError(`Amount must be at least $${details.minInvestment.toLocaleString()}.`);
    } else if (details.maxInvestment && value > details.maxInvestment) {
        setError(`Amount cannot exceed $${details.maxInvestment.toLocaleString()}.`);
    } else {
        setError('');
    }
  }

  const handleConfirmClick = () => {
    if (error || isProcessing) return;
    onConfirm(amount);
  };
  
  const tokenAmount = amount / 1; // Assuming 1 token = $1 for this example

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Invest in {details.tournamentName}</DialogTitle>
          <DialogDescription>
            You are investing in the <strong>{details.tierName}</strong> tier.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Investment Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              min={details.minInvestment}
              max={details.maxInvestment}
              className={cn(error && "border-destructive focus-visible:ring-destructive")}
              disabled={isProcessing}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          {details.minInvestment && details.maxInvestment && (
             <Slider
                value={[amount]}
                onValueChange={handleSliderChange}
                min={details.minInvestment}
                max={details.maxInvestment}
                step={10}
                disabled={isProcessing}
            />
          )}
          <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
            <div className="flex justify-between">
                <span>You will receive (approx.):</span>
                <span className="font-medium text-foreground">{tokenAmount.toLocaleString()} {details.tokenTicker}</span>
            </div>
             <div className="flex justify-between text-xs mt-1">
                <span>Your wallet balance:</span>
                <span className="text-foreground">$5,432.10</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            By confirming, you agree to lock your funds until the tournament concludes. Platform fees will apply to winnings. Please review the terms before proceeding.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isProcessing}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleConfirmClick} disabled={isProcessing || !!error || amount <= 0}>
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Investment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
