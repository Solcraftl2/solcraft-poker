import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { SocialPlayer } from "@/lib/types";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"; // For rank changes
import Link from "next/link";
import { Button } from "../ui/button";

interface RankingsTableProps {
  players: SocialPlayer[];
}

export function RankingsTable({ players }: RankingsTableProps) {
  // Sort players by rank for display
  const sortedPlayers = [...players].sort((a, b) => (a.ranking || Infinity) - (b.ranking || Infinity));

  const getRankChangeIcon = (index: number) => {
    // Placeholder logic for rank change simulation
    if (index % 3 === 0 && index !== 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (index % 5 === 0 && index !== 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">Rank</TableHead>
          <TableHead>Player</TableHead>
          <TableHead>Total Invested</TableHead>
          <TableHead>Overall Return</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedPlayers.map((player, index) => (
          <TableRow key={player.id}>
            <TableCell>
              <div className="flex items-center">
                <span className="font-bold text-lg mr-1">{player.ranking || '-'}</span>
                {getRankChangeIcon(index)}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint="player avatar" />
                  <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{player.name}</p>
                  <p className="text-xs text-muted-foreground">@{player.username}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>${player.totalInvested.toLocaleString()}</TableCell>
            <TableCell>
              <Badge variant={player.overallReturn >= 0 ? "secondary" : "destructive"}
               className={player.overallReturn >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
              >
                {player.overallReturn.toFixed(2)}%
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/profile/${player.username}`}> {/* Assuming profile pages by username */}
                  View Profile
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
