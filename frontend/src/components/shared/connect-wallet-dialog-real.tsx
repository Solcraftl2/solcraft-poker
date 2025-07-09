'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ConnectWalletDialogRealProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect?: (walletName: string) => void;
}

export function ConnectWalletDialogReal({ open, onOpenChange, onConnect }: ConnectWalletDialogRealProps) {
  const { wallet, connected, connecting, connect, disconnect, publicKey } = useWallet();
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const router = useRouter();

  // Update connection status based on wallet state
  useEffect(() => {
    if (connecting) {
      setConnectionStatus('connecting');
    } else if (connected && publicKey) {
      setConnectionStatus('connected');
      if (onConnect && wallet) {
        onConnect(wallet.adapter.name);
      }
      // Auto redirect to dashboard after successful connection
      setTimeout(() => {
        onOpenChange(false);
        router.push('/dashboard');
      }, 1500);
    } else if (!connected && !connecting) {
      setConnectionStatus('idle');
    }
  }, [connected, connecting, publicKey, wallet, onConnect, onOpenChange, router]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setConnectionStatus('idle');
      setErrorMessage('');
    }
  }, [open]);

  const handleContinueWithoutWallet = () => {
    // Store guest session
    localStorage.setItem('solcraft_session', JSON.stringify({
      type: 'guest',
      connectedAt: new Date().toISOString()
    }));
    
    onOpenChange(false);
    router.push('/dashboard');
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setConnectionStatus('idle');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {connectionStatus === 'connecting' && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="flex items-center space-x-3 p-4">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Connecting to {wallet?.adapter.name}...</p>
                  <p className="text-sm text-blue-700">Please approve the connection in your wallet.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {connectionStatus === 'connected' && publicKey && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="flex items-center space-x-3 p-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Successfully connected!</p>
                  <p className="text-sm text-green-700">
                    Wallet: {wallet?.adapter.name}
                  </p>
                  <p className="text-xs text-green-600 font-mono">
                    {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
                  </p>
                  <p className="text-sm text-green-700">Redirecting to dashboard...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {connectionStatus === 'error' && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-center space-x-3 p-4">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Connection failed</p>
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {connectionStatus === 'idle' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a wallet to connect to SolCraft
                </p>
                
                {/* Solana Wallet Multi Button - handles all wallet connections */}
                <div className="wallet-adapter-button-trigger">
                  <WalletMultiButton className="!bg-purple-600 !hover:bg-purple-700 !text-white !rounded-lg !font-semibold !px-6 !py-3 !w-full" />
                </div>
              </div>
            </div>
          )}

          {!connected && connectionStatus !== 'connecting' && connectionStatus !== 'connected' && (
            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleContinueWithoutWallet}
                className="flex-1"
              >
                Continue as Guest
              </Button>
            </div>
          )}

          {connected && (
            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="flex-1"
              >
                Disconnect
              </Button>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  router.push('/dashboard');
                }}
                className="flex-1"
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

