import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { SocialPlayer } from "@/lib/types";
import { UserPlus, UserCheck, TrendingUp, Award } from "lucide-react";

interface PlayerCardProps {
  player: SocialPlayer;
  onFollowToggle: (playerId: string) => void; // Placeholder
}

export function PlayerCard({ player, onFollowToggle }: PlayerCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-muted/30 p-4 text-center">
        <Avatar className="mx-auto h-20 w-20 mb-2 border-2 border-primary">
          <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint="player avatar"/>
          <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <CardTitle className="font-headline text-lg">{player.name}</CardTitle>
        <CardDescription>@{player.username}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-3 text-sm">
        <p className="text-muted-foreground italic line-clamp-2 h-10">{player.bio || "No bio available."}</p>
        <div className="flex justify-around text-center">
          <div>
            <p className="font-semibold text-foreground">{player.followersCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">{player.followingCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
          {player.ranking && (
             <div>
              <p className="font-semibold text-foreground">#{player.ranking}</p>
              <p className="text-xs text-muted-foreground">Rank</p>
            </div>
          )}
        </div>
        <div className="p-2 bg-primary/10 rounded-md text-xs">
          <div className="flex items-center text-primary font-medium">
            <Award className="h-4 w-4 mr-1 flex-shrink-0" />
            Recent: {player.recentPerformance}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <Button 
          variant={player.isFollowed ? "outline" : "default"} 
          className="w-full" 
          onClick={() => onFollowToggle(player.id)}
        >
          {player.isFollowed ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
          {player.isFollowed ? "Following" : "Follow"}
        </Button>
      </CardFooter>
    </Card>
  );
}
