
import { notFound } from "next/navigation";
import { mockTournaments } from "@/lib/mock-data";
import { TournamentDetailClient } from "@/components/tournaments/tournament-detail-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Fetch tournament data from API with fallback to mock data
async function getTournamentData(id: string) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  if (useMock) {
    return mockTournaments.find((t) => t.id === id);
  }

  try {
    const res = await fetch(`${API_URL}/api/tournaments/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return mockTournaments.find((t) => t.id === id);
  }
}

// Generate static paths for known tournaments at build time
export async function generateStaticParams() {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  if (useMock) {
    return mockTournaments.map((tournament) => ({ id: tournament.id }));
  }

  try {
    const res = await fetch(`${API_URL}/api/tournaments`);
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    return data.map((t: any) => ({ id: String(t.id) }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return mockTournaments.map((tournament) => ({ id: tournament.id }));
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
