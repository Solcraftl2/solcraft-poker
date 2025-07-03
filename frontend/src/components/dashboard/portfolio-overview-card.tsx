import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import type { PortfolioData } from "@/lib/types";

interface PortfolioOverviewCardProps {
  data: PortfolioData;
}

export function PortfolioOverviewCard({ data }: PortfolioOverviewCardProps) {
  const returnPositive = data.overallReturn >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Portfolio Overview</CardTitle>
        <CardDescription>Your current investment performance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-1" />
              Total Value
            </div>
            <div className="text-2xl font-bold text-foreground">
              ${data.totalValue.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center text-sm text-muted-foreground">
              {returnPositive ? <TrendingUp className="h-4 w-4 mr-1 text-green-500" /> : <TrendingDown className="h-4 w-4 mr-1 text-red-500" />}
              Overall Return
            </div>
            <div className={`text-2xl font-bold ${returnPositive ? 'text-green-500' : 'text-red-500'}`}>
              {data.overallReturn.toFixed(2)}%
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Total Invested</span>
            <span>${data.totalInvested.toLocaleString()}</span>
          </div>
          <Progress value={(data.totalInvested / (data.totalValue > 0 ? data.totalValue : 1)) * 100} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Updated just now.
      </CardFooter>
    </Card>
  );
}
