"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  LogOut, 
  Loader2,
  ChevronDown 
} from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { ConnectWalletDialog } from "./connect-wallet-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface WalletButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function WalletButton({ 
  className, 
  variant = "outline", 
  size = "default" 
}: WalletButtonProps) {
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const { 
    connected, 
    connecting, 
    disconnecting,
    walletAddress, 
    walletName,
    balance,
    disconnect 
  } = useWallet();
  const { toast } = useToast();

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
        .then(() => {
          toast({ 
            title: "Indirizzo Copiato!", 
            description: `${walletAddress.substring(0, 10)}...${walletAddress.slice(-10)}` 
          });
        })
        .catch(() => {
          toast({ 
            title: "Errore", 
            description: "Impossibile copiare l'indirizzo.", 
            variant: "destructive" 
          });
        });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast({ 
        title: "Wallet Disconnesso", 
        description: "Il wallet è stato disconnesso con successo." 
      });
    } catch (error) {
      toast({ 
        title: "Errore", 
        description: "Impossibile disconnettere il wallet.", 
        variant: "destructive" 
      });
    }
  };

  const openExplorer = () => {
    if (walletAddress) {
      const explorerUrl = `https://explorer.solana.com/address/${walletAddress}?cluster=devnet`;
      window.open(explorerUrl, '_blank');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 4)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: number) => {
    return balance.toFixed(4);
  };

  // Wallet non connesso
  if (!connected) {
    return (
      <>
        <Button
          variant={variant}
          size={size}
          className={cn("gap-2", className)}
          onClick={() => setIsConnectDialogOpen(true)}
          disabled={connecting}
        >
          {connecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connessione...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4" />
              Connetti Wallet
            </>
          )}
        </Button>
        
        <ConnectWalletDialog
          open={isConnectDialogOpen}
          onOpenChange={setIsConnectDialogOpen}
        />
      </>
    );
  }

  // Wallet connesso
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("gap-2", className)}
          disabled={disconnecting}
        >
          {disconnecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Disconnessione...
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {formatAddress(walletAddress || "")}
                  </span>
                  {balance !== null && (
                    <span className="text-xs text-muted-foreground">
                      {formatBalance(balance)} SOL
                    </span>
                  )}
                </div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {walletName || "Wallet Connesso"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {walletAddress && formatAddress(walletAddress)}
            </p>
            {balance !== null && (
              <p className="text-xs leading-none text-muted-foreground">
                Balance: {formatBalance(balance)} SOL
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCopyAddress}>
          <Copy className="mr-2 h-4 w-4" />
          Copia Indirizzo
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={openExplorer}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Vedi su Explorer
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleDisconnect}
          className="text-red-600 dark:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnetti
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

