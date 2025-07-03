
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Investment } from "@/lib/types";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

interface InvestmentHistoryCardProps {
  investments: Investment[];
  limit?: number;
}

export function InvestmentHistoryCard({ investments, limit = 5 }: InvestmentHistoryCardProps) {
  const displayedInvestments = investments.slice(0, limit);

  const getStatusVariant = (status: Investment['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Active': return 'default';
      case 'Pending': return 'outline';
      case 'Cashed Out': return 'secondary';
      case 'Lost': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Recent Investments</CardTitle>
        <CardDescription>A quick look at your latest investment activities.</CardDescription>
      </CardHeader>
      <CardContent>
        {displayedInvestments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tournament</TableHead>
                <TableHead>Amount (USD)</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedInvestments.map((investment) => (
                <TableRow key={investment.id}>
                  <TableCell className="font-medium">{investment.tournamentName}</TableCell>
                  <TableCell>${investment.investmentValueUSD.toLocaleString()}</TableCell>
                  <TableCell>{investment.tokenAmount.toLocaleString()}</TableCell>
                  <TableCell>{format(new Date(investment.investmentDate), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getStatusVariant(investment.status)}>{investment.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-4">No recent investments found.</p>
        )}
      </CardContent>
       {investments.length > limit && (
        <CardFooter className="justify-end">
          <Button variant="link" asChild>
            <Link href="/profile#investments">
              View all investments <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
