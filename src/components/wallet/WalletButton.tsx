'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '../ui/button';

export const WalletButton: React.FC = () => {
    const { wallet, connect, disconnect, connecting, connected } = useWallet();

    return (
        <div className="flex items-center gap-4">
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !px-4 !py-2 !text-white !font-medium !transition-colors" />
            
            {connected && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Connected to {wallet?.adapter.name}</span>
                </div>
            )}
        </div>
    );
};

