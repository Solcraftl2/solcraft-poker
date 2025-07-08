"use client";

import { clusterApiUrl } from "@solana/web3.js";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  WalletAdapterNetwork,
  type WalletName,
} from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { createContext, useContext, useMemo, useState } from "react";
import { useWalletAuth } from "@/hooks/use-wallet-auth";

import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletConnectionContextValue {
  network: WalletAdapterNetwork;
  setNetwork: (network: WalletAdapterNetwork) => void;
}

const WalletConnectionContext = createContext<WalletConnectionContextValue | undefined>(undefined);

export function useWalletConnection() {
  const ctx = useContext(WalletConnectionContext);
  if (!ctx) {
    throw new Error("useWalletConnection must be used within WalletConnectionProvider");
  }
  return ctx;
}

export function WalletConnectionProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetwork] = useState<WalletAdapterNetwork>(WalletAdapterNetwork.Devnet);
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  useWalletAuth();

  return (
    <WalletConnectionContext.Provider value={{ network, setNetwork }}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </WalletConnectionContext.Provider>
  );
}
