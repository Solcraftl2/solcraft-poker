
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface WalletOption {
  id: string;
  name: string;
  iconUrl: string;
  aiHint: string;
}

// Updated to common Solana wallet options
const walletOptions: WalletOption[] = [
  { id: "phantom", name: "Phantom", iconUrl: "https://placehold.co/48x48/A06FFA/FFFFFF.png?text=P", aiHint: "phantom logo" },
  { id: "solflare", name: "Solflare", iconUrl: "https://placehold.co/48x48/F07A00/FFFFFF.png?text=S", aiHint: "solflare logo" },
  { id: "backpack", name: "Backpack", iconUrl: "https://placehold.co/48x48/8A2BE2/FFFFFF.png?text=B", aiHint: "backpack logo" },
  { id: "torus", name: "Torus", iconUrl: "https://placehold.co/48x48/0074FF/FFFFFF.png?text=T", aiHint: "torus logo" },
  { id: "ledger", name: "Ledger", iconUrl: "https://placehold.co/48x48/4A4A4A/FFFFFF.png?text=L", aiHint: "ledger logo" },
  { id: "glow", name: "Glow", iconUrl: "https://placehold.co/48x48/FFA500/000000.png?text=G", aiHint: "glow wallet logo" },
];

interface ConnectWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (selectedWalletName: string) => void;
}

export function ConnectWalletDialog({ open, onOpenChange, onConnect }: ConnectWalletDialogProps) {
  const [selectedWallet, setSelectedWallet] = useState<string>(walletOptions[0].id); // Default to Phantom

  const handleContinue = () => {
    const wallet = walletOptions.find(w => w.id === selectedWallet);
    if (wallet) {
      onConnect(wallet.name);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground p-0 shadow-2xl rounded-xl">
        <DialogHeader className="p-6 pb-4 text-center relative">
          <div className="absolute top-4 right-4">
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-muted/50">
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DialogClose>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 bg-primary/10 rounded-lg mb-3">
              <WalletIcon className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-xl font-semibold text-foreground">
              Connect Wallet
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => setSelectedWallet(wallet.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border-2 transition-all duration-150 ease-in-out aspect-square",
                  "bg-muted/30 hover:bg-muted/60",
                  selectedWallet === wallet.id ? "border-primary" : "border-border hover:border-muted-foreground/50"
                )}
              >
                <Image
                  src={wallet.iconUrl}
                  alt={`${wallet.name} icon`}
                  width={32}
                  height={32}
                  className="mb-1 sm:mb-2 rounded-md h-8 w-8 sm:h-10 sm:w-10"
                  data-ai-hint={wallet.aiHint}
                  onError={(e) => { 
                    const target = e.target as HTMLImageElement;
                    target.srcset = ""; // Prevent Next.js from trying to use srcset for placeholder
                    target.src = 'https://placehold.co/48x48.png?text=W'; 
                    target.alt = `${wallet.name} Placeholder Icon`;
                  }}
                />
                <span className="text-xs sm:text-sm font-medium text-foreground text-center">{wallet.name}</span>
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 flex flex-col sm:flex-row sm:justify-between gap-3">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full sm:w-auto h-11 text-base bg-muted/50 hover:bg-muted/80 border-muted-foreground/30 hover:border-muted-foreground/60 text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleContinue} className="w-full sm:w-auto h-11 text-base" disabled={!selectedWallet}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
