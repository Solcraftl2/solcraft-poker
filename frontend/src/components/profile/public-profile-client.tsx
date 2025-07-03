
'use client';

import { useState, useEffect, useTransition } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { InvestmentHistoryCard } from "@/components/dashboard/investment-history-card";
import { Mail, CalendarDays, DollarSign, TrendingUp, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { UserProfile, Investment, SocialPlayer } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { toggleFollow } from "@/lib/actions/social.actions";

interface PublicProfileClientProps {
    player: SocialPlayer;
    investments: Investment[];
}

export function PublicProfileClient({ player, investments }: PublicProfileClientProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isFollowing, setIsFollowing] = useState(player.isFollowed || false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleFollowToggle = () => {
    if (!currentUser) {
        toast({ title: "Authentication Required", description: "You must be logged in to follow users.", variant: "destructive" });
        return;
    }
    if (currentUser.uid === player.uid) {
        toast({ title: "Action not allowed", description: "You cannot follow yourself.", variant: "destructive" });
        return;
    }

    startTransition(async () => {
        const result = await toggleFollow(currentUser.uid, player.uid, isFollowing);
        if (result.success) {
            setIsFollowing(!isFollowing);
            toast({ title: result.message });
        } else {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        }
    });
  }

  const profileNameDisplay = player.name || player.username || "User";
  const profileAvatarUrl = player.avatarUrl || `https://placehold.co/100x100.png?text=${profileNameDisplay.substring(0,1).toUpperCase()}`;
  const profileJoinedDate = player.joinedDate ? format(parseISO(player.joinedDate), "MMMM d, yyyy") : "N/A";

  return (
    <>
      <PageHeader
        title={profileNameDisplay}
        description={`@${player.username}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-2 border-4 border-primary">
                <AvatarImage src={profileAvatarUrl} alt={profileNameDisplay} />
                <AvatarFallback>{profileNameDisplay.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-2xl">{profileNameDisplay}</CardTitle>
              <CardDescription>@{player.username}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p className="text-muted-foreground italic text-center">
                {player.bio || "This user hasn't set a bio yet."}
              </p>

              <div className="flex items-center pt-2">
                <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Joined: {profileJoinedDate}</span>
              </div>
              
              {currentUser && currentUser.uid !== player.uid && (
                <Button className="w-full mt-4" variant={isFollowing ? "outline" : "default"} onClick={handleFollowToggle} disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : isFollowing ? <UserCheck className="mr-2 h-4 w-4"/> : <UserPlus className="mr-2 h-4 w-4" />}
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Followers:</span>
                <span className="font-semibold">{(player.followersCount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Following:</span>
                <span className="font-semibold">{(player.followingCount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Invested:</span>
                <span className="font-semibold">${(player.totalInvested || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Overall Return:</span>
                <span className={`font-semibold ${(player.overallReturn || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(player.overallReturn || 0).toFixed(2)}%
                </span>
              </div>
              {player.ranking && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Global Rank:</span>
                  <span className="font-semibold">#{player.ranking}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <InvestmentHistoryCard investments={investments} limit={10} />
        </div>
      </div>
    </>
  );
}
