
import { notFound } from "next/navigation";
import { mockSocialPlayers, mockInvestments } from "@/lib/mock-data";
import { PublicProfileClient } from "@/components/profile/public-profile-client";

// This function would typically fetch data from a DB or API
async function getPlayerData(username: string) {
  // Find the player in mock data
  const player = mockSocialPlayers.find(
    (p) => p.username.toLowerCase() === username.toLowerCase()
  );
  if (!player) {
    return null;
  }
  // Find investments for this player (mocking this)
  const investments = mockInvestments.filter(inv => inv.investorId === player.id);
  return { player, investments };
}

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const data = await getPlayerData(params.username);

  if (!data) {
    notFound();
  }

  return <PublicProfileClient player={data.player} investments={data.investments} />;
}
