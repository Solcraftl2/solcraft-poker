import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Coins, Loader2 } from "lucide-react";
import type { WalletInfo } from "@/lib/types";

interface MyBalanceCardProps {
  walletInfo?: WalletInfo | null;
}

export function MyBalanceCard({ walletInfo }: MyBalanceCardProps) {
  // Calculate total balance in USD (assuming 1 SOLP = $1 for now)
  const totalBalanceUSD = walletInfo 
    ? (walletInfo.solp_balance + walletInfo.sol_balance + walletInfo.staked_amount) * 1
    : 0;

  // Calculate 24h change (mock for now, would come from price API)
  const change24h = 2.34; // This would be calculated from price history
  const isPositive = change24h >= 0;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-blue-200 dark:border-blue-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
          My Balance
        </CardTitle>
        <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Balance */}
          <div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {walletInfo ? (
                `$${totalBalanceUSD.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}`
              ) : (
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading...
                </div>
              )}
            </div>
            <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
              {isPositive ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              <span className={isPositive ? "text-green-600" : "text-red-600"}>
                {isPositive ? "+" : ""}{change24h}% (24h)
              </span>
            </div>
          </div>

          {/* Token Breakdown */}
          {walletInfo && (
            <div className="space-y-3">
              {/* SOLP Balance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Coins className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-sm font-medium">SOLP</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {walletInfo.solp_balance.toLocaleString('en-US', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${(walletInfo.solp_balance * 1).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* SOL Balance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-orange-600 mr-2" />
                  <span className="text-sm font-medium">SOL</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {walletInfo.sol_balance.toLocaleString('en-US', { 
                      minimumFractionDigits: 4, 
                      maximumFractionDigits: 4 
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${(walletInfo.sol_balance * 100).toFixed(2)} {/* Assuming SOL = $100 */}
                  </div>
                </div>
              </div>

              {/* Staked Amount */}
              {walletInfo.staked_amount > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium">Staked</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {walletInfo.staked_amount.toLocaleString('en-US', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })} SOLP
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${(walletInfo.staked_amount * 1).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Rewards */}
              {walletInfo.pending_rewards > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Badge variant="secondary" className="text-xs">
                      Pending Rewards
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      +{walletInfo.pending_rewards.toFixed(4)} SOLP
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Wallet not connected state */}
          {!walletInfo && (
            <div className="text-center py-4">
              <Wallet className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                Connect your wallet to view balance
              </p>
              <Button size="sm" variant="outline">
                Connect Wallet
              </Button>
            </div>
          )}

          {/* Last Updated */}
          {walletInfo && (
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              Last updated: {new Date(walletInfo.last_updated * 1000).toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

