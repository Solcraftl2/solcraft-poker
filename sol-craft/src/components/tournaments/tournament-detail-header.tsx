
'use client';

import Image from "next/image";
import type { Tournament } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, DollarSign, ShieldCheck, ShieldAlert, Shield, Info, TrophyIcon as TrophyIconLucide, Check } from "lucide-react";
import { format, parseISO } from "date-fns";

interface TournamentDetailHeaderProps {
  tournament: Tournament;
}

export function TournamentDetailHeader({ tournament }: TournamentDetailHeaderProps) {
  
  const getStatusPillClasses = (status: Tournament['status']) => {
    switch (status) {
      case 'Upcoming': return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
      case 'Live': return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700";
      case 'Finished': return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
      default: return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-500";
    }
  };

  const getRiskPillClasses = (riskLevel?: string) => {
    if (!riskLevel) return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-500";
    switch (riskLevel) {
      case 'Low': return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
      case 'Medium': return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700";
      case 'High': return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
      default: return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-500";
    }
  };
  
  const RiskIcon = tournament.aiRiskAssessment?.riskLevel === 'Low' ? ShieldCheck :
                   tournament.aiRiskAssessment?.riskLevel === 'Medium' ? Shield :
                   tournament.aiRiskAssessment?.riskLevel === 'High' ? ShieldAlert : Info;


  return (
    <div className="mb-8">
      <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-lg mb-6">
        {tournament.imageUrl ? (
          <Image
            src={tournament.imageUrl}
            alt={tournament.name}
            layout="fill"
            objectFit="cover"
            priority
            data-ai-hint="poker game"
            onError={(e) => {
              (e.target as HTMLImageElement).srcset = ""; 
              (e.target as HTMLImageElement).src = 'https://placehold.co/800x400.png'; 
              (e.target as HTMLImageElement).alt = `${tournament.name} Placeholder Image`;
            }}
          />
        ) : (
          <div className="bg-muted w-full h-full flex items-center justify-center">
            <TrophyIconLucide className="w-24 h-24 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-white shadow-text">
            {tournament.name}
          </h1>
          <p className="text-lg text-gray-200 shadow-text">{tournament.platform}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
        <InfoPill Icon={CalendarDays} label="Starts" value={format(parseISO(tournament.startTime), "MMM d, yyyy 'at' p")} />
        <InfoPill Icon={DollarSign} label="Buy-in" value={`$${tournament.buyIn.toLocaleString()}`} />
        <InfoPill Icon={DollarSign} label="Prize Pool" value={`$${tournament.guaranteedPrizePool.toLocaleString()} GTD`} />
        {tournament.participants && (
          <InfoPill Icon={Users} label="Players" value={`${tournament.participants.current}${tournament.participants.max ? ` / ${tournament.participants.max}` : ''}`} />
        )}
        <div className={`flex items-center space-x-2 p-3 rounded-lg border ${getStatusPillClasses(tournament.status)}`}>
          <span className="font-medium">{tournament.status}</span>
        </div>
        {tournament.aiRiskAssessment?.riskLevel && (
           <div className={`flex items-center space-x-2 p-3 rounded-lg border ${getRiskPillClasses(tournament.aiRiskAssessment.riskLevel)}`}>
            <RiskIcon className="h-5 w-5" />
            <span className="font-medium">AI Risk: {tournament.aiRiskAssessment.riskLevel}</span>
          </div>
        )}
        {tournament.isCompleted && typeof tournament.prizeWon !== 'undefined' && (
           <div className={`flex items-center space-x-2 p-3 rounded-lg border ${getRiskPillClasses('Low')}`}> {/* Assuming 'Low' risk style for prize display */}
            <Check className="h-5 w-5 text-green-500" />
            <span className="font-medium">Prize Won: ${tournament.prizeWon.toLocaleString()}</span>
          </div>
        )}
      </div>

      {tournament.description && (
        <p className="mt-6 text-muted-foreground">{tournament.description}</p>
      )}
    </div>
  );
}

interface InfoPillProps {
  Icon: React.ElementType;
  label: string;
  value: string;
}

function InfoPill({ Icon, label, value }: InfoPillProps) {
  return (
    <div className="flex items-center space-x-2 p-3 bg-card border rounded-lg shadow-sm">
      <Icon className="h-5 w-5 text-primary" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
    
