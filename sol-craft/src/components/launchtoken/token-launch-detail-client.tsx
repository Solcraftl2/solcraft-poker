'use client';

import type { TokenLaunch } from "@/lib/types";
// import TokenLaunchDetailHeader from "src/components/launchtoken/";
// import { TokenLaunchParticipateCard } from "@/components/launchtoken/";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Calendar, Clock, BarChart, Info, Shield, Users } from "lucide-react";
import { format, parseISO } from "date-fns";

interface TokenLaunchDetailClientProps {
  launch: TokenLaunch;
}

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg">
        <div className="text-xs text-muted-foreground flex items-center">
            <Icon className="h-3.5 w-3.5 mr-1.5" />
            {label}
        </div>
        <div className="font-semibold text-foreground text-sm">{value}</div>
    </div>
);


export function TokenLaunchDetailClient({ launch }: TokenLaunchDetailClientProps) {
  return (
    <div className="container mx-auto py-8">
      {/* <TokenLaunchDetailHeader launch={launch} /> */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Project Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line">{launch.description}</p>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Sale Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   <DetailItem icon={Coins} label="Token Price" value={`$${launch.tokenPrice} per ${launch.ticker}`} />
                   <DetailItem icon={BarChart} label="Target Raise" value={`$${launch.targetRaise.toLocaleString()}`} />
                   {launch.startDate && <DetailItem icon={Calendar} label="Start Date" value={format(parseISO(launch.startDate), "MMM d, yyyy")} />}
                   {launch.endDate && <DetailItem icon={Clock} label="End Date" value={format(parseISO(launch.endDate), "MMM d, yyyy")} />}
                   <DetailItem icon={Shield} label="Vesting Schedule" value={launch.vestingSchedule || "N/A"} />
                   <DetailItem icon={Info} label="Category" value={launch.category || "N/A"} />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Tokenomics</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   <DetailItem icon={Coins} label="Total Supply" value={`${(launch.totalSupply || 0).toLocaleString()} ${launch.ticker}`} />
                   <DetailItem icon={Coins} label="Circulating Supply on Launch" value={`${(launch.circulatingSupplyOnLaunch || 0).toLocaleString()} ${launch.ticker}`} />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Team</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12 text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Team information coming soon.</p>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
          {/* <TokenLaunchParticipateCard launch={launch} /> */}
        </div>
      </div>
    </div>
  );
}
