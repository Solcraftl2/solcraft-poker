"use client";
import { useState, useMemo, useEffect } from 'react';
import Image from "next/image";
import { PageHeader } from "@/components/shared/page-header";
import { TournamentCard } from "@/components/tournaments/tournament-card";
import { mockTournaments } from "@/lib/mock-data";
import { api } from "@/lib/api-config";
import type { Tournament } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ListFilter, Search, Trophy } from "lucide-react";

export default function TournamentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [buyInRange, setBuyInRange] = useState('any');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
    if (useMock) {
      setTournaments(mockTournaments);
      return;
    }
    api.getTournaments()
      .then((data) => {
        setTournaments(data as Tournament[]);
      })
      .catch((err) => {
        console.error('Failed to fetch tournaments:', err);
        setTournaments(mockTournaments);
      });
  }, []);

  const filteredTournaments = useMemo(() => {
    return tournaments.filter(tournament => {
      const searchMatch = searchTerm === '' || tournament.name.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'all' || tournament.status.toLowerCase() === statusFilter.toLowerCase();
      const buyInMatch = (() => {
        if (buyInRange === 'any') return true;
        if (buyInRange.endsWith('+')) {
          const min = parseInt(buyInRange.slice(0, -1), 10);
          return tournament.buyIn >= min;
        }
        const parts = buyInRange.split('-');
        const min = parseInt(parts[0], 10);
        const max = parseInt(parts[1], 10);
        if (!isNaN(min) && !isNaN(max)) {
          return tournament.buyIn >= min && tournament.buyIn <= max;
        }
        return true;
      })();
      return searchMatch && statusMatch && buyInMatch;
    });
  }, [searchTerm, statusFilter, buyInRange]);

  return (
    <>
      <PageHeader
        title="Browse Tournaments"
        description="Find exciting poker tournaments to invest in."
      />

      <div className="relative mb-6 rounded-lg overflow-hidden shadow-lg">
        <Image
          src="https://placehold.co/1200x400.png"
          alt="SolCraft Poker Tournament"
          width={1200}
          height={400}
          className="w-full h-auto object-cover"
          priority
          data-ai-hint="poker tournament game"
        />
         <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-4">
          <Trophy className="w-16 h-16 text-primary mb-4 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-white">Find Your Next Big Win</h2>
          <p className="text-lg text-gray-200 mt-2 max-w-2xl">
            Explore a wide range of tournaments, from daily freerolls to high-stakes showdowns. Analyze, invest, and win with SolCraft.
          </p>
        </div>
      </div>

      <div className="mb-6 p-4 border rounded-lg bg-card shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-muted-foreground mb-1">Search Tournaments</label>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="search" placeholder="Enter tournament name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
                <SelectItem value="Live">Live</SelectItem>
                <SelectItem value="Finished">Finished</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="buyin" className="block text-sm font-medium text-muted-foreground mb-1">Buy-in Range</label>
            <Select value={buyInRange} onValueChange={setBuyInRange}>
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
          <Button className="w-full lg:w-auto" disabled>
            <ListFilter className="mr-2 h-4 w-4" /> Filters Applied
          </Button>
        </div>
      </div>

      {filteredTournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">
            <ListFilter className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg">No tournaments match your criteria.</p>
            <p className="text-sm">Try adjusting your filters or check back later.</p>
        </div>
      )}
    </>
  );
}
