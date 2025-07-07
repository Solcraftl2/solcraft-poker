"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bitcoin, Copy, Landmark, Shuffle, CreditCard, Wallet, Coins, Diamond } from "lucide-react"; // Using Diamond for SOL

const tokens = [
  { value: "btc", label: "Bitcoin", icon: <Bitcoin className="h-5 w-5 mr-2 text-orange-400" /> },
  { value: "eth", label: "Ethereum", icon: <Coins className="h-5 w-5 mr-2 text-gray-400" /> },
  { value: "sol", label: "Solana", icon: <Diamond className="h-5 w-5 mr-2 text-purple-400" /> }, // Using Diamond for Solana
];

const depositMethods = [
  { id: "fromWallet", label: "From Wallet", icon: Wallet },
  { id: "fromExchange", label: "From Exchange", icon: Landmark },
  { id: "crossChain", label: "Cross Chain", icon: Shuffle },
  { id: "buyWithCard", label: "Buy with Card", icon: CreditCard },
];

export function DepositForm() {
  const [selectedToken, setSelectedToken] = useState("btc");
  const [selectedMethod, setSelectedMethod] = useState("buyWithCard"); // Default to "Buy with Card" as per image
  const { toast } = useToast();

  const walletAddress = "sol...4x2z"; // Example wallet address

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
      .then(() => {
        toast({ title: "Wallet Address Copied!", description: walletAddress });
      })
      .catch(err => {
        toast({ title: "Failed to copy", description: "Could not copy address to clipboard.", variant: "destructive" });
      });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Select Token & QR */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-muted-foreground">1. Select Token</Label>
          <Select value={selectedToken} onValueChange={setSelectedToken}>
            <SelectTrigger className="w-full h-12 text-base">
              <div className="flex items-center">
                {tokens.find(t => t.value === selectedToken)?.icon}
                <SelectValue placeholder="Select a token" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {tokens.map((token) => (
                <SelectItem key={token.value} value={token.value} className="text-base py-2">
                  <div className="flex items-center">
                    {token.icon}
                    {token.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-4 mt-4 p-3 bg-muted/30 rounded-lg">
            <Image
              src="https://placehold.co/100x100.png"
              alt="QR Code"
              width={100}
              height={100}
              className="rounded-md border"
              data-ai-hint="qr code"
            />
            <div className="flex-grow space-y-2">
              <div className="relative">
                <Input
                  type="text"
                  value={walletAddress}
                  readOnly
                  className="pr-10 h-10 bg-background border-border"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={handleCopyAddress}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Send only {tokens.find(t => t.value === selectedToken)?.label || 'selected token'} to this address. Incorrect deposits may be lost.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Choose Deposit Method */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-muted-foreground">2. Choose Deposit Method</Label>
          <div className="grid grid-cols-2 gap-3">
            {depositMethods.map((method) => (
              <Button
                key={method.id}
                variant={selectedMethod === method.id ? "default" : "outline"}
                className="h-16 text-sm flex-col items-center justify-center space-y-1 md:flex-row md:space-y-0 md:space-x-2 md:justify-start md:pl-4"
                onClick={() => setSelectedMethod(method.id)}
              >
                <method.icon className="h-5 w-5 mb-1 md:mb-0" />
                <span>{method.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Button size="lg" className="w-full h-12 text-base font-semibold">
        Continue to Payment
      </Button>
    </div>
  );
}
