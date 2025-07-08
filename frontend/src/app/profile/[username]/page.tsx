
import { notFound } from "next/navigation";
import { mockSocialPlayers, mockInvestments } from "@/lib/mock-data";
import api from "@/lib/api-config";
import { PublicProfileClient } from "@/components/profile/public-profile-client";

async function getPlayerData(username: string) {
  try {
    const players = await api.getPlayers();
    const player = (Array.isArray(players) ? players : []).find(
      (p: any) => p.username && p.username.toLowerCase() === username.toLowerCase()
    );
    if (!player) return null;
    const investments = mockInvestments.filter(inv => inv.investorId === player.id);
    return { player, investments };
  } catch (err) {
    console.error('Failed to fetch player profile', err);
    const fallback = mockSocialPlayers.find(
      (p) => p.username.toLowerCase() === username.toLowerCase()
    );
    if (!fallback) return null;
    const investments = mockInvestments.filter(inv => inv.investorId === fallback.id);
    return { player: fallback, investments };
  }
}

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const data = await getPlayerData(params.username);

  if (!data) {
    notFound();
  }

  return <PublicProfileClient player={data.player} investments={data.investments} />;
}
