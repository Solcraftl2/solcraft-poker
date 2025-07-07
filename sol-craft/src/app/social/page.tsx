"use client"; // For client-side interactions like follow toggle

import { PageHeader } from "@/components/shared/page-header";
import { PlayerCard } from "@/components/social/player-card";
import { RankingsTable } from "@/components/social/rankings-table";
import { mockSocialPlayers } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Users, Award } from "lucide-react";
import { useState } from "react";
import type { SocialPlayer } from "@/lib/types";


export default function SocialPage() {
  const [players, setPlayers] = useState<SocialPlayer[]>(mockSocialPlayers);

  // Placeholder for follow toggle logic
  const handleFollowToggle = (playerId: string) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(p => 
        p.id === playerId ? { ...p, isFollowed: !p.isFollowed } : p
      )
    );
    // Here you would typically call an API
    console.log(`Toggled follow for player ${playerId}`);
  };
  
  return (
    <>
      <PageHeader
        title="Community Hub"
        description="Connect with other investors and follow top players."
      />

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search players or topics..." className="pl-10" />
        </div>
      </div>

      <Tabs defaultValue="top-players" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="top-players"><Users className="mr-2 h-4 w-4 sm:inline hidden"/>Top Players</TabsTrigger>
          <TabsTrigger value="rankings"><Award className="mr-2 h-4 w-4 sm:inline hidden"/>Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="top-players">
          {players.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.slice(0,6).map((player) => ( // Show top 6 for this tab
                <PlayerCard key={player.id} player={player} onFollowToggle={handleFollowToggle} />
              ))}
            </div>
          ) : (
             <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-xl text-muted-foreground">No players found.</p>
              </div>
          )}
        </TabsContent>

        <TabsContent value="rankings">
          {players.length > 0 ? (
            <RankingsTable players={players} />
          ) : (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-xl text-muted-foreground">No rankings available yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
