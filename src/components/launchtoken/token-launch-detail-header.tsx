
'use client';

import Image from "next/image";
import type { TokenLaunch } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, BookOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TokenLaunchDetailHeaderProps {
  launch: TokenLaunch;
}

export function TokenLaunchDetailHeader({ launch }: TokenLaunchDetailHeaderProps) {
    const getStageBadgeClassNames = (stage: TokenLaunch['stage']): string => {
    switch (stage) {
      case 'Live': return 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse';
      case 'Upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Ended': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'TBA': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'border-muted-foreground/30 text-muted-foreground';
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Image
            src={launch.logoUrl}
            alt={`${launch.name} logo`}
            width={80}
            height={80}
            className="rounded-lg border-2 border-border"
            data-ai-hint={`${launch.ticker} logo`}
          />
          <div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">
              {launch.name}
            </h1>
            <p className="text-lg text-primary font-semibold">${launch.ticker}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
             <Badge className={cn("text-sm py-1 px-3", getStageBadgeClassNames(launch.stage))}>
                {launch.stage}
            </Badge>
            {launch.projectWebsite && (
                 <Button variant="outline" asChild>
                    <Link href={launch.projectWebsite} target="_blank">
                        <Globe className="mr-2 h-4 w-4" /> Website
                    </Link>
                </Button>
            )}
             {launch.whitepaperLink && (
                 <Button variant="outline" asChild>
                    <Link href={launch.whitepaperLink} target="_blank">
                        <BookOpen className="mr-2 h-4 w-4" /> Whitepaper
                    </Link>
                </Button>
            )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
            {launch.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
      </div>
    </div>
  );
}
