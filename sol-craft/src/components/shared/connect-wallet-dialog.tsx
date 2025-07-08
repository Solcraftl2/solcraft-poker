
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
import { Wallet as WalletIcon, X, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";

interface ConnectWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect?: (selectedWalletName: string) => void;
}

export function ConnectWalletDialog({ open, onOpenChange, onConnect }: ConnectWalletDialogProps) {
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const { connect, connecting, supportedWallets } = useWallet();
  const { toast } = useToast();

  // Imposta il primo wallet come default quando si apre il dialog
  useState(() => {
    if (supportedWallets.length > 0 && !selectedWallet) {
      setSelectedWallet(supportedWallets[0].name.toLowerCase());
    }
  });

  const handleContinue = async () => {
    if (!selectedWallet || connecting) return;

    try {
      const walletName = supportedWallets.find(w => w.name.toLowerCase() === selectedWallet)?.name;
      if (!walletName) return;

      await connect(walletName);
      
      toast({
        title: "Wallet Connesso!",
        description: `${walletName} è stato connesso con successo.`,
      });

      // Chiama callback se fornito (per compatibilità)
      if (onConnect) {
        onConnect(walletName);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Errore connessione wallet:', error);
      toast({
        title: "Errore Connessione",
        description: error instanceof Error ? error.message : "Impossibile connettersi al wallet.",
        variant: "destructive",
      });
    }
  };

  const detectWalletInstalled = (walletName: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    switch (walletName.toLowerCase()) {
      case 'phantom':
        return !!(window as any).phantom?.solana;
      case 'solflare':
        return !!(window as any).solflare;
      case 'backpack':
        return !!(window as any).backpack;
      default:
        return false;
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
              Connetti Wallet
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Scegli il tuo wallet Solana per iniziare
            </p>
          </div>
        </DialogHeader>

        <div className="px-6 py-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {supportedWallets.map((wallet) => {
              const isInstalled = detectWalletInstalled(wallet.name);
              const walletId = wallet.name.toLowerCase();
              
              return (
                <button
                  key={walletId}
                  onClick={() => setSelectedWallet(walletId)}
                  disabled={connecting}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border-2 transition-all duration-150 ease-in-out aspect-square relative",
                    "bg-muted/30 hover:bg-muted/60",
                    selectedWallet === walletId ? "border-primary" : "border-border hover:border-muted-foreground/50",
                    connecting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Image
                    src={wallet.icon}
                    alt={`${wallet.name} icon`}
                    width={32}
                    height={32}
                    className="mb-1 sm:mb-2 rounded-md h-8 w-8 sm:h-10 sm:w-10"
                    onError={(e) => { 
                      const target = e.target as HTMLImageElement;
                      target.srcset = "";
                      target.src = 'https://placehold.co/48x48.png?text=W'; 
                      target.alt = `${wallet.name} Placeholder Icon`;
                    }}
                  />
                  <span className="text-xs sm:text-sm font-medium text-foreground text-center">
                    {wallet.name}
                  </span>
                  
                  {/* Indicatore stato installazione */}
                  <div className="absolute top-1 right-1">
                    {isInstalled ? (
                      <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-background" title="Installato" />
                    ) : (
                      <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-background" title="Demo mode" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info sui wallet non installati */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Wallet non installati</p>
                <p>I wallet con indicatore arancione funzioneranno in modalità demo. Per la connessione reale, installa l'estensione del wallet dal loro sito ufficiale.</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 flex flex-col sm:flex-row sm:justify-between gap-3">
          <DialogClose asChild>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full sm:w-auto h-11 text-base bg-muted/50 hover:bg-muted/80 border-muted-foreground/30 hover:border-muted-foreground/60 text-muted-foreground hover:text-foreground"
              disabled={connecting}
            >
              Annulla
            </Button>
          </DialogClose>
          <Button 
            onClick={handleContinue} 
            className="w-full sm:w-auto h-11 text-base" 
            disabled={!selectedWallet || connecting}
          >
            {connecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connessione...
              </>
            ) : (
              "Connetti"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
