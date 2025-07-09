'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/components/providers/wallet-provider-simple';

interface ConnectWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: () => void;
}

export function ConnectWalletDialogSimple({ open, onOpenChange, onConnect }: ConnectWalletDialogProps) {
  const { wallets, connect, connecting } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const handleWalletSelect = async (walletName: string) => {
    setSelectedWallet(walletName);
    try {
      await connect(walletName);
      onConnect();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setSelectedWallet(null);
    }
  };

  const handleCancel = () => {
    setSelectedWallet(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🔗</span>
            Connect Wallet
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          {wallets.map((wallet) => (
            <Button
              key={wallet.name}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2 relative"
              onClick={() => handleWalletSelect(wallet.name)}
              disabled={connecting && selectedWallet === wallet.name}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                {wallet.icon}
              </div>
              <span className="text-sm font-medium">{wallet.name}</span>
              {!wallet.installed && (
                <span className="text-xs text-muted-foreground absolute bottom-1">
                  Not installed
                </span>
              )}
              {connecting && selectedWallet === wallet.name && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={onConnect} 
            className="flex-1"
            disabled={connecting}
          >
            Continue
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
        </p>
      </DialogContent>
    </Dialog>
  );
}

