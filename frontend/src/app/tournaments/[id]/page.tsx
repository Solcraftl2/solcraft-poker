
import { notFound } from "next/navigation";
import { mockTournaments } from "@/lib/mock-data";
import api from "@/lib/api-config";
import { TournamentDetailClient } from "@/components/tournaments/tournament-detail-client";

// Fetch tournament data from API with mock fallback
async function getTournamentData(id: string) {
  try {
    return await api.getTournament(id);
  } catch (err) {
    console.error('Failed to fetch tournament', err);
    return mockTournaments.find((t) => t.id === id);
  }
}

// Generate static paths for known tournaments at build time
export async function generateStaticParams() {
  try {
    const tournaments = await api.getTournaments();
    return Array.isArray(tournaments)
      ? tournaments.map((t: any) => ({ id: t.id }))
      : mockTournaments.map((t) => ({ id: t.id }));
  } catch {
    return mockTournaments.map((t) => ({ id: t.id }));
  }
}

interface PageProps {
  params: {
    id: string;
  };
}
export default async function TournamentDetailPage({ params }: PageProps) {
  const tournament = await getTournamentData(params.id);

  if (!tournament) {
    notFound();
  }

  return <TournamentDetailClient tournament={tournament} />;
}
