import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Tournament } from "@/lib/types";
import { DollarSign, CalendarDays, Users, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { format, parseISO } from "date-fns";

interface TournamentCardProps {
  tournament: Tournament;
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const getStatusVariant = (status: Tournament['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Upcoming': return 'default'; // Blueish
      case 'Live': return 'secondary'; // Greenish or Yellowish (using secondary from theme)
      case 'Finished': return 'outline'; // Greyish
      default: return 'default';
    }
  };
  
  // Truncate description
  const shortDescription = tournament.description 
    ? tournament.description.length > 100 
      ? tournament.description.substring(0, 97) + "..." 
      : tournament.description
    : "No description available.";

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      {tournament.imageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={tournament.imageUrl}
            alt={tournament.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint="poker tournament"
            onError={(e) => {
              (e.target as HTMLImageElement).srcset = ""; // Prevent Next.js from trying to use srcset for placeholder
              (e.target as HTMLImageElement).src = 'https://placehold.co/600x400.png';
              (e.target as HTMLImageElement).alt = `${tournament.name} Placeholder Image`;
            }}
          />
           <Badge variant={getStatusVariant(tournament.status)} className="absolute top-2 right-2">
            {tournament.status}
          </Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="font-headline text-xl">{tournament.name}</CardTitle>
        <CardDescription>{tournament.platform || 'Online Tournament'}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <p className="text-sm text-muted-foreground">{shortDescription}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-primary" />
            <span>Buy-in: ${tournament.buyIn.toLocaleString()}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-primary" />
            <span>Prize: ${tournament.guaranteedPrizePool.toLocaleString()} GTD</span>
          </div>
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-2 text-primary" />
            <span>Starts: {format(parseISO(tournament.startTime), "MMM d, p")}</span>
          </div>
          {tournament.participants && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-primary" />
              <span>
                {tournament.participants.current}
                {tournament.participants.max ? ` / ${tournament.participants.max}` : ''} Players
              </span>
            </div>
          )}
        </div>
        {tournament.aiRiskAssessment && (
           <div className={`mt-2 p-2 rounded-md text-xs flex items-center ${
            tournament.aiRiskAssessment.riskLevel === 'Low' ? 'bg-green-100 text-green-700' :
            tournament.aiRiskAssessment.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {tournament.aiRiskAssessment.riskLevel === 'Low' && <CheckCircle className="h-4 w-4 mr-1" />}
            {tournament.aiRiskAssessment.riskLevel === 'Medium' && <Info className="h-4 w-4 mr-1" />}
            {tournament.aiRiskAssessment.riskLevel === 'High' && <AlertTriangle className="h-4 w-4 mr-1" />}
            AI Risk: {tournament.aiRiskAssessment.riskLevel}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="default">
          <Link href={`/tournaments/${tournament.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
