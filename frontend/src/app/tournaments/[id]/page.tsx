
import { notFound } from "next/navigation";
import { mockTournaments } from "@/lib/mock-data";
// import { TournamentDetailClient } from "@/components/tournaments/tournament-detail-client";

// This function would typically fetch data from a DB or API
async function getTournamentData(id: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500)); 
  const tournament = mockTournaments.find((t) => t.id === id);
  return tournament;
}

// Generate static paths for known tournaments at build time
export async function generateStaticParams() {
  return mockTournaments.map((tournament) => ({
    id: tournament.id,
  }));
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

  // return <TournamentDetailClient tournament={tournament} />;
}
