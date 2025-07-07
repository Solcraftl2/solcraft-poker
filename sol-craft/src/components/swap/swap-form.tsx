
"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bitcoin, Coins, Diamond, ArrowUpDown, Settings2, ArrowRightLeft } from "lucide-react";
import { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SwapConfirmationDialog, type SwapConfirmationData } from "./swap-confirmation-dialog";

interface Token {
  value: string;
  label: string;
  ticker: string;
  icon: JSX.Element;
  balance: number;
}

const initialTokens: Token[] = [
  { value: "btc", label: "Bitcoin", ticker: "BTC", icon: <Bitcoin className="h-5 w-5 mr-2 text-orange-400" />, balance: 1.45 },
  { value: "eth", label: "Ethereum", ticker: "ETH", icon: <Coins className="h-5 w-5 mr-2 text-green-500" />, balance: 0.06 }, // Updated icon color and balance for consistency
  { value: "sol", label: "Solana", ticker: "SOL", icon: <Diamond className="h-5 w-5 mr-2 text-purple-400" />, balance: 120.587 },
  { value: "usdt", label: "Tether", ticker: "USDT", icon: <Coins className="h-5 w-5 mr-2 text-green-500" />, balance: 1234.587 },
];

interface TokenInputSectionProps {
  label: "FROM" | "TO";
  selectedTokenValue: string;
  onTokenChange: (value: string) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  tokens: Token[];
  onPercentageClick: (percentage: number) => void;
  usdValue: string;
}

function TokenInputSection({
  label,
  selectedTokenValue,
  onTokenChange,
  amount,
  onAmountChange,
  tokens,
  onPercentageClick,
  usdValue,
}: TokenInputSectionProps) {
  const selectedTokenDetails = tokens.find(t => t.value === selectedTokenValue);

  return (
    <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="grid grid-cols-3 gap-2 items-end">
        <div className="col-span-2">
          <Select value={selectedTokenValue} onValueChange={onTokenChange}>
            <SelectTrigger className="h-12 text-base bg-background border-input">
              <div className="flex items-center">
                {selectedTokenDetails?.icon}
                <SelectValue placeholder="Select token" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {tokens.map((token) => (
                <SelectItem key={token.value} value={token.value} className="text-base py-2">
                  <div className="flex items-center">
                    {token.icon}
                    <span>{token.label} <span className="text-muted-foreground">({token.ticker})</span></span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.0"
          className="h-12 text-base text-right bg-background border-input"
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        <div className="text-xs text-muted-foreground">
          Balance: {selectedTokenDetails?.balance.toFixed(selectedTokenDetails?.ticker === 'BTC' ? 2 : selectedTokenDetails?.ticker === 'ETH' ? 2 : 3)} {selectedTokenDetails?.ticker}
        </div>
        <div className="flex space-x-1">
          {[0.25, 0.5, 1].map((perc) => (
            <Button
              key={perc}
              variant="ghost"
              size="sm"
              onClick={() => onPercentageClick(perc)}
              className="px-2 py-1 h-6 text-xs bg-primary/10 text-primary hover:bg-primary/20"
            >
              {perc === 1 ? "MAX" : `${perc * 100}%`}
            </Button>
          ))}
        </div>
      </div>
      <div className="text-xs text-muted-foreground text-right h-4">
         {amount && parseFloat(amount) > 0 && `≈ $${usdValue}`}
      </div>
    </div>
  );
}

export function SwapForm() {
  const [tokensState, setTokensState] = useState<Token[]>(initialTokens);
  const [fromTokenValue, setFromTokenValue] = useState(initialTokens[0].value); // Default to BTC
  const [toTokenValue, setToTokenValue] = useState(initialTokens[1].value); // Default to ETH
  const [fromAmount, setFromAmount] = useState("1.45"); // Default to match image
  const [toAmount, setToAmount] = useState("0.06"); // Default to match image
  const [useBundleEngine, setUseBundleEngine] = useState(true);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState<SwapConfirmationData | null>(null);

  // Dummy USD values for display
  const fromUsdValue = (parseFloat(fromAmount || "0") * (20000 / 1.0)).toFixed(2); // Example rate for BTC
  const toUsdValue = (parseFloat(toAmount || "0") * (1400 / 1.0)).toFixed(2);   // Example rate for ETH


  const handlePercentageClick = (
    percentage: number,
    tokenValue: string,
    setAmount: Dispatch<SetStateAction<string>>,
    isFromToken: boolean
  ) => {
    const tokenDetails = tokensState.find(t => t.value === tokenValue);
    if (tokenDetails) {
      const newAmount = tokenDetails.balance * percentage;
      setAmount(newAmount.toFixed(tokenDetails.ticker === 'BTC' ? 8 : 5)); // Adjust precision based on token
      
      // Simulate calculating the other amount (dummy logic based on fixed rate for example)
      const btcToEthRate = 14.2;
      if (isFromToken) { // Setting FROM amount
        if (tokenDetails.ticker === 'BTC') {
          setToAmount((newAmount * btcToEthRate).toFixed(5));
        } else if (tokenDetails.ticker === 'ETH') {
           setToAmount((newAmount / btcToEthRate).toFixed(8)); // if ETH is from, then to is BTC
        }
      } else { // Setting TO amount
         if (tokenDetails.ticker === 'ETH') {
          setFromAmount((newAmount / btcToEthRate).toFixed(8));
        } else if (tokenDetails.ticker === 'BTC') {
           setFromAmount((newAmount * btcToEthRate).toFixed(5)); // if BTC is to, then from is ETH
        }
      }
    }
  };
  
  const handleSwapTokenFields = () => {
    const tempToken = fromTokenValue;
    setFromTokenValue(toTokenValue);
    setToTokenValue(tempToken);

    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleSwap = () => {
    const fromTokenDetails = tokensState.find(t => t.value === fromTokenValue);
    const toTokenDetails = tokensState.find(t => t.value === toTokenValue);

    if (!fromTokenDetails || !toTokenDetails || !fromAmount || !toAmount || parseFloat(fromAmount) <= 0) {
      alert("Please select tokens and enter a valid amount to swap.");
      return;
    }

    // Use the current amounts from the form state for the dialog
    const currentFromAmount = parseFloat(fromAmount);
    const currentToAmount = parseFloat(toAmount);

    // Calculate exchange rate based on current amounts for display
    // This is just an example; a real app would get this from an API
    const displayExchangeRate = currentFromAmount > 0 && currentToAmount > 0
        ? `1 ${fromTokenDetails.ticker} = ${(currentToAmount / currentFromAmount).toFixed(4)} ${toTokenDetails.ticker}`
        : "N/A";


    setConfirmationData({
      fromAmount: currentFromAmount,
      fromToken: { ...fromTokenDetails, icon: fromTokenDetails.icon },
      toAmount: currentToAmount,
      toToken: { ...toTokenDetails, icon: toTokenDetails.icon },
      // Values from the image for other fields
      exchangeRate: "1 BTC = 14.2 ETH",
      priceSlippage: "0.5%",
      transactionFee: "0.0032 BTC ($1.25)",
      minReceived: `${(currentToAmount * 0.995).toFixed(4)} ${toTokenDetails.ticker}`, // Example min received with 0.5% slippage
      useBundleEngine: useBundleEngine,
      bundleCountdown: "Next in 17s",
      transactionsInBundle: 3,
    });
    setIsConfirmDialogOpen(true);
  };

  return (
    <>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="font-headline text-xl">Swap</CardTitle>
          <Button variant="ghost" size="icon">
            <Settings2 className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-4 md:px-6">
        <TokenInputSection
          label="FROM"
          selectedTokenValue={fromTokenValue}
          onTokenChange={setFromTokenValue}
          amount={fromAmount}
          onAmountChange={(val) => {
            setFromAmount(val);
            // Auto-calculate 'TO' amount if 'FROM' changes (example rate)
            const numVal = parseFloat(val);
            if (!isNaN(numVal) && tokensState.find(t => t.value === fromTokenValue)?.ticker === 'BTC' && tokensState.find(t => t.value === toTokenValue)?.ticker === 'ETH') {
              setToAmount((numVal * 14.2).toFixed(5));
            }
          }}
          tokens={tokensState}
          onPercentageClick={(p) => handlePercentageClick(p, fromTokenValue, setFromAmount, true)}
          usdValue={fromUsdValue}
        />

        <div className="flex justify-center -my-3">
          <Button variant="outline" size="icon" className="rounded-full border-2 bg-background hover:bg-muted z-10" onClick={handleSwapTokenFields}>
            <ArrowUpDown className="h-4 w-4 text-primary" />
          </Button>
        </div>

        <TokenInputSection
          label="TO"
          selectedTokenValue={toTokenValue}
          onTokenChange={setToTokenValue}
          amount={toAmount}
          onAmountChange={(val) => {
            setToAmount(val);
            // Auto-calculate 'FROM' amount if 'TO' changes (example rate)
            const numVal = parseFloat(val);
            if (!isNaN(numVal) && tokensState.find(t => t.value === toTokenValue)?.ticker === 'ETH' && tokensState.find(t => t.value === fromTokenValue)?.ticker === 'BTC') {
              setFromAmount((numVal / 14.2).toFixed(8));
            }
          }}
          tokens={tokensState}
          onPercentageClick={(p) => handlePercentageClick(p, toTokenValue, setToAmount, false)}
          usdValue={toUsdValue}
        />

        <Separator />

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Exchange Rate</span>
            <span>
              1 {tokensState.find(t=>t.value === fromTokenValue)?.ticker || 'TokenA'} ≈ 
              {(parseFloat(toAmount || "0") / (parseFloat(fromAmount || "1") || 1)).toFixed(4)} {tokensState.find(t=>t.value === toTokenValue)?.ticker || 'TokenB'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price Slippage</span>
            <span>0.5%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction Fee</span>
            <span>0.0001 {tokensState.find(t=>t.value === fromTokenValue)?.ticker || 'TokenA'}</span>
          </div>
           <div className="flex justify-between font-medium">
            <span className="text-muted-foreground">Min Received</span>
            <span>{(parseFloat(toAmount || "0") * 0.995).toFixed(4)} {tokensState.find(t=>t.value === toTokenValue)?.ticker || 'TokenB'}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="bundle-engine" className="text-sm font-medium">
              Use Bundle Engine (save gas)
            </Label>
            <Switch
              id="bundle-engine"
              checked={useBundleEngine}
              onCheckedChange={setUseBundleEngine}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Countdown to Next Bundle: Next 1h 11s <br />
            Transactions in current bundle: 1
          </p>
        </div>
      </CardContent>
      <CardFooter className="px-4 md:px-6 pb-6 pt-4">
        <Button size="lg" className="w-full h-12 text-base font-semibold" onClick={handleSwap}>
          Swap
        </Button>
      </CardFooter>

      {confirmationData && (
        <SwapConfirmationDialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
          data={confirmationData}
        />
      )}
    </>
  );
}

