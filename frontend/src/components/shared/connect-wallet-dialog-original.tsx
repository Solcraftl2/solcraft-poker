'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Wallet types
interface WalletOption {
  name: string;
  icon: string;
  color: string;
  installed?: boolean;
}

const walletOptions: WalletOption[] = [
  { name: 'Phantom', icon: 'P', color: 'bg-purple-500', installed: true },
  { name: 'Solflare', icon: 'S', color: 'bg-orange-500', installed: false },
  { name: 'Backpack', icon: 'B', color: 'bg-purple-700', installed: false },
  { name: 'Torus', icon: 'T', color: 'bg-blue-500', installed: false },
  { name: 'Ledger', icon: 'L', color: 'bg-gray-600', installed: false },
  { name: 'Glow', icon: 'G', color: 'bg-yellow-500', installed: false },
];

interface ConnectWalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectWalletDialog({ isOpen, onClose }: ConnectWalletDialogProps) {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const router = useRouter();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedWallet(null);
      setIsConnecting(false);
      setConnectionStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleWalletSelect = async (walletName: string) => {
    setSelectedWallet(walletName);
    setIsConnecting(true);
    setConnectionStatus('connecting');
    setErrorMessage('');

    try {
      // Simulate wallet connection process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if wallet is installed (simulate)
      const wallet = walletOptions.find(w => w.name === walletName);
      if (!wallet?.installed && walletName !== 'Phantom') {
        throw new Error(`${walletName} wallet is not installed. Please install it first.`);
      }

      // Simulate successful connection
      setConnectionStatus('connected');
      
      // Store wallet connection in localStorage
      localStorage.setItem('solcraft_wallet', JSON.stringify({
        name: walletName,
        address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', // Mock address
        connected: true,
        connectedAt: new Date().toISOString()
      }));

      // Wait a moment to show success state
      setTimeout(() => {
        onClose();
        // Redirect to dashboard
        router.push('/dashboard');
      }, 1500);

    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to connect wallet');
      setIsConnecting(false);
    }
  };

  const handleContinueWithoutWallet = () => {
    // Store guest session
    localStorage.setItem('solcraft_session', JSON.stringify({
      type: 'guest',
      connectedAt: new Date().toISOString()
    }));
    
    onClose();
    router.push('/dashboard');
  };

  const handleCancel = () => {
    if (isConnecting) {
      setIsConnecting(false);
      setConnectionStatus('idle');
      setSelectedWallet(null);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            onClick={onClose}
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
                  <p className="font-medium text-blue-900">Connecting to {selectedWallet}...</p>
                  <p className="text-sm text-blue-700">Please approve the connection in your wallet.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {connectionStatus === 'connected' && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="flex items-center space-x-3 p-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Successfully connected!</p>
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
            <div className="grid grid-cols-3 gap-3">
              {walletOptions.map((wallet) => (
                <Button
                  key={wallet.name}
                  variant="outline"
                  className="h-20 flex-col space-y-2 hover:bg-muted"
                  onClick={() => handleWalletSelect(wallet.name)}
                  disabled={isConnecting}
                >
                  <div className={`w-8 h-8 rounded-lg ${wallet.color} flex items-center justify-center text-white font-bold`}>
                    {wallet.icon}
                  </div>
                  <span className="text-xs">{wallet.name}</span>
                  {!wallet.installed && (
                    <span className="text-xs text-muted-foreground">Not installed</span>
                  )}
                </Button>
              ))}
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={connectionStatus === 'connected'}
              className="flex-1"
            >
              {isConnecting ? 'Cancel' : 'Cancel'}
            </Button>
            <Button
              onClick={handleContinueWithoutWallet}
              disabled={isConnecting || connectionStatus === 'connected'}
              className="flex-1"
            >
              Continue
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

