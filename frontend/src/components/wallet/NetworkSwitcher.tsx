"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useWalletConnection } from "./WalletConnectionProvider";

export function NetworkSwitcher() {
  const { network, setNetwork } = useWalletConnection();

  return (
    <select
      value={network}
      onChange={(e) => setNetwork(e.target.value as WalletAdapterNetwork)}
      className="border rounded px-2 py-1 text-sm bg-background"
    >
      <option value={WalletAdapterNetwork.Devnet}>Devnet</option>
      <option value={WalletAdapterNetwork.Testnet}>Testnet</option>
      <option value={WalletAdapterNetwork.Mainnet}>Mainnet</option>
    </select>
  );
}
