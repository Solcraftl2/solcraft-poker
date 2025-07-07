
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { TokenLaunch } from '@/lib/types';
import { ExternalLink, Info, TrendingUp, CheckCircle, PlayCircle, CalendarClock, Tag, Coins, Target } from 'lucide-react';
import { formatDistanceToNowStrict, format, parseISO } from 'date-fns';
import { cn } from "@/lib/utils"; // Added missing import

interface TokenLaunchCardProps {
  launch: TokenLaunch;
}

export function TokenLaunchCard({ launch }: TokenLaunchCardProps) {
  const progressPercentage = launch.targetRaise > 0 ? (launch.raisedAmount / launch.targetRaise) * 100 : 0;

  const getStageBadgeVariant = (stage: TokenLaunch['stage']): "default" | "secondary" | "destructive" | "outline" => {
    switch (stage) {
      case 'Live': return 'default'; // Typically primary color
      case 'Upcoming': return 'secondary';
      case 'Ended': return 'outline';
      case 'TBA': return 'outline';
      default: return 'outline';
    }
  };
  
  const getStageBadgeClassNames = (stage: TokenLaunch['stage']): string => {
    switch (stage) {
      case 'Live': return 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse';
      case 'Upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Ended': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'TBA': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'border-muted-foreground/30 text-muted-foreground';
    }
  };

  const getButtonText = () => {
    switch (launch.stage) {
      case 'Live': return 'Participate Now';
      case 'Upcoming': return 'Register Interest';
      case 'Ended': return 'View Results';
      case 'TBA': return 'Learn More';
      default: return 'View Details';
    }
  };

  const getTimeRemaining = () => {
    if (launch.stage === 'Live' && launch.endDate) {
      return `${formatDistanceToNowStrict(parseISO(launch.endDate))} left`;
    }
    if (launch.stage === 'Upcoming' && launch.startDate) {
      return `Starts in ${formatDistanceToNowStrict(parseISO(launch.startDate))}`;
    }
    return null;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-primary/10 transition-shadow duration-300 border border-border hover:border-primary/50">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <Image
              src={launch.logoUrl}
              alt={`${launch.name} logo`}
              width={48}
              height={48}
              className="rounded-md border"
              data-ai-hint={`${launch.ticker} logo token`}
            />
            <div>
              <CardTitle className="font-headline text-lg">{launch.name}</CardTitle>
              <CardDescription className="text-sm text-primary">${launch.ticker}</CardDescription>
            </div>
          </div>
          <Badge variant={getStageBadgeVariant(launch.stage)} className={cn("text-xs", getStageBadgeClassNames(launch.stage))}>
            {launch.stage}
          </Badge>
        </div>
        {launch.isFeatured && <Badge variant="secondary" className="mt-2 w-fit bg-accent/20 text-accent border-accent/30">Featured</Badge>}
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3 h-[60px]">{launch.description}</p>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Progress ({progressPercentage.toFixed(1)}%)</span>
            <span>Target: ${launch.targetRaise.toLocaleString()} {launch.currency}</span>
          </div>
          <Progress value={progressPercentage} aria-label={`${launch.name} funding progress`} className="h-2" />
          <div className="text-xs text-foreground text-right">
            Raised: ${launch.raisedAmount.toLocaleString()} {launch.currency}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs pt-1">
          <div className="flex items-center text-muted-foreground">
            <Coins className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
            Token Price:
            <span className="ml-auto font-medium text-foreground">${launch.tokenPrice.toFixed(3)}</span>
          </div>
          {launch.category && (
            <div className="flex items-center text-muted-foreground">
              <Tag className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
              Category:
              <span className="ml-auto font-medium text-foreground">{launch.category}</span>
            </div>
          )}
          {launch.startDate && (
             <div className="flex items-center text-muted-foreground">
                <PlayCircle className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                Starts:
                <span className="ml-auto font-medium text-foreground">{format(parseISO(launch.startDate), "MMM d, yyyy")}</span>
            </div>
          )}
           {launch.endDate && (
             <div className="flex items-center text-muted-foreground">
                <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                Ends:
                <span className="ml-auto font-medium text-foreground">{format(parseISO(launch.endDate), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>

        {timeRemaining && (
          <div className="flex items-center text-xs text-amber-500 bg-amber-500/10 p-1.5 rounded-md">
            <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
            {timeRemaining}
          </div>
        )}

      </CardContent>
      <CardFooter className="p-4 grid grid-cols-2 gap-2 border-t">
        <Button variant="outline" asChild>
          <Link href={launch.detailsLink}>
            <Info className="mr-2 h-4 w-4" /> Details
          </Link>
        </Button>
        <Button variant="default" disabled={launch.stage === 'Ended' || launch.stage === 'TBA'}>
          <Target className="mr-2 h-4 w-4" /> {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
}

    
