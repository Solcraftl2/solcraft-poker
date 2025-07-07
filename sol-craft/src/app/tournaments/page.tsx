"use client";
import Image from "next/image"; // Added
import { PageHeader } from "@/components/shared/page-header";
import { TournamentCard } from "@/components/tournaments/tournament-card";
import { mockTournaments } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";

export default function TournamentsPage() {
  // Placeholder for filtering and sorting logic
  const tournaments = mockTournaments;

  return (
    <>
      <PageHeader
        title="Browse Tournaments"
        description="Find exciting poker tournaments to invest in."
      />

      {/* Thematic Banner Image */}
      <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
        <Image
          src="https://placehold.co/800x400.png"
          alt="SolCraft Poker Tournament"
          width={800}
          height={400}
          className="w-full h-auto object-cover"
          priority
          data-ai-hint="poker tournament game"
        />
      </div>

      <div className="mb-6 p-4 border rounded-lg bg-card shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-muted-foreground mb-1">Search Tournaments</label>
            <Input id="search" placeholder="Enter tournament name..." />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
            <Select>
              <SelectTrigger id="status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="buyin" className="block text-sm font-medium text-muted-foreground mb-1">Buy-in Range</label>
            <Select>
              <SelectTrigger id="buyin">
                <SelectValue placeholder="Any Buy-in" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Buy-in</SelectItem>
                <SelectItem value="0-50">$0 - $50</SelectItem>
                <SelectItem value="51-200">$51 - $200</SelectItem>
                <SelectItem value="201+">$201+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full lg:w-auto">
            <ListFilter className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
        </div>
      </div>

      {tournaments.length > 0 ? (
        // Replace this with your new client component if needed
        // <ClientTournamentsGrid tournaments={tournaments} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No tournaments match your criteria.</p>
          <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or check back later.</p>
        </div>
      )}
    </>
  );
}
