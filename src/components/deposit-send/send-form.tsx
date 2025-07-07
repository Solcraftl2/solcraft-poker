"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Bitcoin, Coins, Diamond, ArrowRight } from "lucide-react"; // Using Diamond for SOL

const tokens = [
  { value: "btc", label: "Bitcoin", icon: <Bitcoin className="h-5 w-5 mr-2 text-orange-400" /> },
  { value: "eth", label: "Ethereum", icon: <Coins className="h-5 w-5 mr-2 text-gray-400" /> },
  { value: "sol", label: "Solana", icon: <Diamond className="h-5 w-5 mr-2 text-purple-400" /> },
];

export function SendForm() {
  const [selectedToken, setSelectedToken] = useState("btc");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for send logic
    console.log("Sending", amount, selectedToken, "to", recipientAddress);
    alert(`Initiating send of ${amount} ${selectedToken.toUpperCase()} to ${recipientAddress} (Placeholder)`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <Label className="text-sm font-semibold text-muted-foreground">1. Select Token to Send</Label>
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
      </div>

      <div className="space-y-4">
        <Label htmlFor="recipientAddress" className="text-sm font-semibold text-muted-foreground">2. Recipient Address</Label>
        <Input
          id="recipientAddress"
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder={`Enter ${tokens.find(t => t.value === selectedToken)?.label || ''} address`}
          className="h-12 text-base"
          required
        />
      </div>

      <div className="space-y-4">
        <Label htmlFor="amount" className="text-sm font-semibold text-muted-foreground">3. Amount to Send</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="h-12 text-base"
          required
          min="0"
          step="any"
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        Network fees will apply. Ensure you have enough balance for the transaction.
      </p>

      <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold">
        Review & Send <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </form>
  );
}
