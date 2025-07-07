'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  LogOut, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedWalletButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function EnhancedWalletButton({ 
  className = '', 
  variant = 'default',
  size = 'default'
}: EnhancedWalletButtonProps) {
  const { wallet, publicKey, connected, connecting, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);

  const handleConnect = () => {
    setVisible(true);
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success('Wallet disconnected successfully');
    } catch (error) {
      toast.error('Failed to disconnect wallet');
    }
  };

  const copyAddress = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey.toString());
        setCopied(true);
        toast.success('Address copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error('Failed to copy address');
      }
    }
  };

  const openExplorer = () => {
    if (publicKey) {
      const url = `https://explorer.solana.com/address/${publicKey.toString()}?cluster=devnet`;
      window.open(url, '_blank');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (connecting) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        disabled
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (!connected || !publicKey) {
    return (
      <Button 
        onClick={handleConnect}
        variant={variant}
        size={size}
        className={className}
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant}
          size={size}
          className={`${className} flex items-center gap-2`}
        >
          <div className="flex items-center gap-2">
            {wallet?.adapter.icon && (
              <img 
                src={wallet.adapter.icon} 
                alt={wallet.adapter.name}
                className="w-4 h-4"
              />
            )}
            <span className="hidden sm:inline">
              {formatAddress(publicKey.toString())}
            </span>
            <span className="sm:hidden">
              {formatAddress(publicKey.toString()).slice(0, 6)}
            </span>
          </div>
          <Badge variant="secondary" className="ml-1">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 mb-2">
            {wallet?.adapter.icon && (
              <img 
                src={wallet.adapter.icon} 
                alt={wallet.adapter.name}
                className="w-5 h-5"
              />
            )}
            <span className="font-medium">{wallet?.adapter.name}</span>
          </div>
          <div className="text-sm text-muted-foreground break-all">
            {publicKey.toString()}
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          {copied ? (
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {copied ? 'Copied!' : 'Copy Address'}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={openExplorer} className="cursor-pointer">
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleDisconnect} 
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

