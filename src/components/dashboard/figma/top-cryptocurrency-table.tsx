
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Cryptocurrency } from "@/lib/types";
import { TrendingUp, TrendingDown, CircleDollarSign } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; 
import { Bitcoin, Coins } from "lucide-react"; // Coins can represent ETH, CircleDollarSign for others


const CryptoIcon = ({ ticker, iconUrl, name }: { ticker: string, iconUrl?: string, name: string }) => {
  // Prioritize specific icons for well-known cryptos
  if (ticker === 'BTC') return <Bitcoin className="h-5 w-5 text-orange-400" />;
  if (ticker === 'ETH') return <Coins className="h-5 w-5 text-gray-400" />; // Using Coins for ETH as a common crypto icon
  if (ticker === 'SOL') return <CircleDollarSign className="h-5 w-5 text-purple-400" />; // Placeholder, can be more specific

  // Fallback to image URL if specific icon isn't set and URL is not a generic placeholder
  if (iconUrl && !iconUrl.startsWith('https://placehold.co')) {
    return (
      <Image 
        src={iconUrl} 
        alt={name} 
        width={20} 
        height={20} 
        className="rounded-full" 
        data-ai-hint={`${name} logo crypto coin`} 
        onError={(e) => {
          (e.target as HTMLImageElement).srcset = ""; // Prevent Next.js from trying to use srcset for placeholder
          (e.target as HTMLImageElement).src = 'https://placehold.co/20x20.png';
          (e.target as HTMLImageElement).alt = `${name} Placeholder Icon`;
        }}
      />
    );
  }
  
  // Generic placeholder if no specific icon or valid image URL
  return <CircleDollarSign className="h-5 w-5 text-muted-foreground" />;
};

type TopCryptocurrencyTableProps = {
  cryptocurrencies: Cryptocurrency[];
  className?: string;
};

export function TopCryptocurrencyTable({ cryptocurrencies, className }: TopCryptocurrencyTableProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Top Cryptocurrency</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">24H Change</TableHead>
              <TableHead className="text-right">24H Volume</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-center">Chart</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cryptocurrencies.map((crypto) => (
              <TableRow key={crypto.id}>
                <TableCell className="text-muted-foreground">{crypto.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CryptoIcon ticker={crypto.ticker} iconUrl={crypto.iconUrl} name={crypto.name} />
                    <div>
                      <span className="font-medium text-foreground">{crypto.name}</span>
                      <span className="text-xs text-muted-foreground ml-1">{crypto.ticker}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right text-foreground">${crypto.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: crypto.price < 1 ? 5 : 2})}</TableCell>
                <TableCell className={cn(
                  "text-right",
                  crypto.change24h >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {crypto.change24h.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right text-muted-foreground">${crypto.volume24h.toLocaleString()}</TableCell>
                <TableCell className="text-right text-muted-foreground">${crypto.marketCap.toLocaleString()}</TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:text-primary/80">
                    {crypto.change24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" /> }
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
