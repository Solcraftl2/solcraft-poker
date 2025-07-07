import { notFound } from "next/navigation";
import { TokenLaunchDetailClient } from "@/components/launchtoken/token-launch-detail-client";
import { getLaunch } from "@/lib/mock-data";

interface PageProps {
  params: {
    id: string;
  };
};

export default async function Page({ params }: PageProps) {
  const launch = await getLaunch(params.id);

  if (!launch) {
    notFound();
  }

  return <TokenLaunchDetailClient launch={launch} />;
}
