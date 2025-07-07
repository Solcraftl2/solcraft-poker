
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, ArrowRightLeft, Bitcoin, Coins, Diamond } from "lucide-react";
import type { ReactNode } from "react";

interface TokenDisplayInfo {
  value: string;
  label: string;
  ticker: string;
  icon: JSX.Element; // Already a JSX element
}

export interface SwapConfirmationData {
  fromAmount: number;
  fromToken: TokenDisplayInfo;
  toAmount: number;
  toToken: TokenDisplayInfo;
  exchangeRate: string;
  priceSlippage: string;
  transactionFee: string;
  minReceived: string;
  useBundleEngine: boolean;
  bundleCountdown: string;
  transactionsInBundle: number;
}

interface SwapConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: SwapConfirmationData;
}

const TokenDisplay = ({ amount, token }: { amount: number; token: TokenDisplayInfo }) => (
  <div className="flex-1 p-3 bg-muted/50 rounded-md border border-border">
    <div className="flex items-center justify-between">
      <span className="text-lg font-semibold text-foreground">{amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: token.ticker === "BTC" ? 8 : 5})}</span>
      <div className="flex items-center">
        {token.icon}
        <div className="ml-2 text-right">
          <div className="text-sm font-medium text-foreground">{token.label}</div>
          <div className="text-xs text-muted-foreground">{token.ticker}</div>
        </div>
      </div>
    </div>
  </div>
);

export function SwapConfirmationDialog({ open, onOpenChange, data }: SwapConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center text-xl font-headline">
              <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
              Swap Confirmed
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <XIcon className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="px-6 space-y-4">
          <div className="flex items-center space-x-2">
            <TokenDisplay amount={data.fromAmount} token={data.fromToken} />
            <ArrowRightLeft className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <TokenDisplay amount={data.toAmount} token={data.toToken} />
          </div>

          <Separator />

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Exchange Rate</span>
              <span className="text-foreground font-medium">{data.exchangeRate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price Slippage</span>
              <span className="text-foreground font-medium">{data.priceSlippage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction Fee</span>
              <span className="text-foreground font-medium">{data.transactionFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min Received</span>
              <span className="text-foreground font-medium">{data.minReceived}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="bundle-engine-confirm" className="text-sm font-medium text-foreground flex items-center">
                Use Bundle Engine <span className="text-muted-foreground ml-1">(save gas)</span>
              </label>
              <Checkbox id="bundle-engine-confirm" checked={data.useBundleEngine} disabled className="border-primary data-[state=checked]:bg-primary"/>
            </div>
            <p className="text-xs text-muted-foreground">
              Countdown to Next Bundle: {data.bundleCountdown} <br />
              Transactions in current bundle: {data.transactionsInBundle}
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4">
          <DialogClose asChild>
            <Button type="button" className="w-full h-11 text-base">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Simple XIcon for the close button in the header
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

// Make sure other token icons are available if needed by SwapConfirmationData
export { Bitcoin, Coins, Diamond };
