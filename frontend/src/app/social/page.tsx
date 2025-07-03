
"use client";
//fff
import { useState, useMemo, useEffect, useTransition } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PlayerCard } from "@/components/social/player-card";
import { RankingsTable } from "@/components/social/rankings-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Users, Award, UserCheck, Loader2 } from "lucide-react";
import type { SocialPlayer } from "@/lib/types";
import { getPlayers, toggleFollow } from "@/lib/actions/social.actions";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Skeleton } from "@/components/ui/skeleton";


export default function SocialPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [players, setPlayers] = useState<SocialPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFollowPending, startFollowTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      // In a real app, you'd also fetch the current user's following list
      // to determine the initial `isFollowed` state. Here, we'll keep it false by default.
      const fetchedPlayers = await getPlayers();
      setPlayers(fetchedPlayers.map(p => ({ ...p, isFollowed: p.isFollowed || false })));
      setIsLoading(false);
    };
    fetchPlayers();
  }, []);


  const handleFollowToggle = (playerId: string) => {
    if (!currentUser) {
      toast({ title: "Authentication Required", description: "You must be logged in to follow users.", variant: "destructive" });
      return;
    }
    if (currentUser.uid === playerId) {
      toast({ title: "Action not allowed", description: "You cannot follow yourself.", variant: "destructive" });
      return;
    }
    
    const playerToToggle = players.find(p => p.id === playerId);
    if (!playerToToggle) return;

    startFollowTransition(async () => {
        // Optimistic UI update
        setPlayers(prevPlayers =>
            prevPlayers.map(p =>
                p.id === playerId ? { ...p, isFollowed: !p.isFollowed } : p
            )
        );

        const result = await toggleFollow(currentUser.uid, playerId, playerToToggle.isFollowed || false);
        
        if (!result.success) {
            // Revert optimistic update on failure
            setPlayers(prevPlayers =>
                prevPlayers.map(p =>
                    p.id === playerId ? { ...p, isFollowed: playerToToggle.isFollowed } : p
                )
            );
            toast({ title: "Error", description: result.message, variant: "destructive" });
        } else {
            toast({ title: result.message });
        }
    });
  };

  const filteredPlayers = useMemo(() => {
    return players.filter(player =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [players, searchTerm]);

  const followedPlayers = useMemo(() => {
    return filteredPlayers.filter(player => player.isFollowed);
  }, [filteredPlayers]);
  
  const loadingSkeletons = Array.from({ length: 6 }, (_, i) => (
      <div key={i} className="space-y-3">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    </div>
  ));

  return (
    <>
      <PageHeader
        title="Community Hub"
        description="Connect with other investors and follow top players."
      />

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search players by name or username..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="top-players" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="top-players"><Users className="mr-2 h-4 w-4 sm:inline hidden" />Top Players</TabsTrigger>
          <TabsTrigger value="following"><UserCheck className="mr-2 h-4 w-4 sm:inline hidden" />Following</TabsTrigger>
          <TabsTrigger value="rankings"><Award className="mr-2 h-4 w-4 sm:inline hidden" />Rankings</TabsTrigger>
        </TabsList>
        
        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loadingSkeletons}
            </div>
        ) : (
        <>
            <TabsContent value="top-players">
            {filteredPlayers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlayers.map((player) => (
                    <PlayerCard key={player.id} player={player} onFollowToggle={handleFollowToggle} />
                ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">
                <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg">No players found.</p>
                <p className="text-sm">Try adjusting your search term.</p>
                </div>
            )}
            </TabsContent>

            <TabsContent value="following">
            {followedPlayers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {followedPlayers.map((player) => (
                    <PlayerCard key={player.id} player={player} onFollowToggle={handleFollowToggle} />
                ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">
                <UserCheck className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg">You are not following anyone yet.</p>
                <p className="text-sm">Explore "Top Players" to find investors to follow.</p>
                </div>
            )}
            </TabsContent>

            <TabsContent value="rankings">
            {filteredPlayers.length > 0 ? (
                <RankingsTable players={filteredPlayers} />
            ) : (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">
                <Award className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg">No rankings available for your search.</p>
                </div>
            )}
            </TabsContent>
        </>
        )}
      </Tabs>
    </>
  );
}
