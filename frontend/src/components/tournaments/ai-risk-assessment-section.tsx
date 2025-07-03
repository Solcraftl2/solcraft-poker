
"use client";

import { useState, useTransition, type FormEvent } from 'react';
import { assessTournamentRisk, type TournamentRiskAssessmentInput, type TournamentRiskAssessmentOutput } from '@/ai/flows/tournament-risk-assessment';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ShieldAlert, ShieldCheck, Shield, Wand2, Info } from "lucide-react";
import type { Tournament } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AiRiskAssessmentSectionProps {
  tournament: Tournament;
  initialAssessment?: TournamentRiskAssessmentOutput;
}

export function AiRiskAssessmentSection({ tournament, initialAssessment }: AiRiskAssessmentSectionProps) {
  const [averagePlayers, setAveragePlayers] = useState(tournament.averagePlayers?.toString() || '');
  const [historicalData, setHistoricalData] = useState(tournament.historicalData || '');
  const [assessmentResult, setAssessmentResult] = useState<TournamentRiskAssessmentOutput | undefined>(initialAssessment);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!averagePlayers || !historicalData) {
      toast({
        title: "Missing Information",
        description: "Please provide average players and historical data for assessment.",
        variant: "destructive",
      });
      return;
    }

    const inputData: TournamentRiskAssessmentInput = {
      tournamentName: tournament.name,
      buyIn: tournament.buyIn,
      guaranteedPrizePool: tournament.guaranteedPrizePool,
      averagePlayers: parseInt(averagePlayers, 10),
      historicalData: historicalData,
    };

    startTransition(async () => {
      try {
        const result = await assessTournamentRisk(inputData);
        setAssessmentResult(result);
        toast({
          title: "Assessment Complete",
          description: `Risk level for ${tournament.name} assessed.`,
        });
      } catch (error) {
        console.error("Error assessing risk:", error);
        toast({
          title: "Assessment Failed",
          description: "Could not retrieve AI risk assessment. Please try again.",
          variant: "destructive",
        });
        setAssessmentResult(undefined); // Clear previous result on error
      }
    });
  };

  const RiskIconComponent = assessmentResult?.riskLevel === 'Low' ? ShieldCheck :
                        assessmentResult?.riskLevel === 'Medium' ? Shield :
                        assessmentResult?.riskLevel === 'High' ? ShieldAlert :
                        Info; // Default icon if no/unknown risk level

  const riskIconColor = assessmentResult?.riskLevel === 'Low' ? 'text-green-500' :
                        assessmentResult?.riskLevel === 'Medium' ? 'text-yellow-500' :
                        assessmentResult?.riskLevel === 'High' ? 'text-red-500' : 
                        'text-muted-foreground';

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline">AI-Powered Risk Assessment</CardTitle>
        </div>
        <CardDescription>
          Analyze this tournament's risk profile using our AI tool. Provide additional data if necessary.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {!assessmentResult && (
            <div className="space-y-4 p-4 border border-dashed rounded-md">
              <p className="text-sm text-muted-foreground">
                To get an AI-powered risk assessment for <strong className="text-foreground">{tournament.name}</strong>, please provide the following details:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="averagePlayers">Average Players (Similar Tournaments)</Label>
                  <Input
                    id="averagePlayers"
                    type="number"
                    value={averagePlayers}
                    onChange={(e) => setAveragePlayers(e.target.value)}
                    placeholder="e.g., 150"
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="historicalData">Historical Data / Notes</Label>
                  <Textarea
                    id="historicalData"
                    value={historicalData}
                    onChange={(e) => setHistoricalData(e.target.value)}
                    placeholder="e.g., Payout structures, player skill observations, past results..."
                    rows={4}
                    required
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Provide context for a more accurate assessment.</p>
                </div>
              </div>
            </div>
          )}

          {assessmentResult && (
            <Alert variant={
              assessmentResult.riskLevel === 'High' ? 'destructive' : 'default'
            } className={
              assessmentResult.riskLevel === 'Medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-300' 
              : assessmentResult.riskLevel === 'Low' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:text-green-300'
              : '' // For High, destructive variant handles styling
            }>
              <RiskIconComponent className={`h-5 w-5 ${riskIconColor}`} />
              <AlertTitle className={`font-headline ${riskIconColor}`}>
                AI Assessment: {assessmentResult.riskLevel} Risk
              </AlertTitle>
              <AlertDescription className="space-y-3 mt-2">
                <div>
                  <h4 className="font-semibold text-sm text-foreground/90">Investment Recommendation:</h4>
                  <p className="text-sm">{assessmentResult.investmentRecommendation}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground/90">Potential Return Estimate:</h4>
                  <p className="text-sm">{assessmentResult.potentialReturn}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground/90">Key Risk Factors Identified:</h4>
                  <ul className="list-disc list-inside pl-2 space-y-0.5 text-sm">
                    {assessmentResult.riskFactors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                    {assessmentResult.riskFactors.length === 0 && <li>No specific major risk factors highlighted by AI.</li>}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-6">
          {assessmentResult && (
            <Button type="button" variant="outline" onClick={() => {
              setAssessmentResult(undefined);
              // Optionally clear form fields if desired, or leave them pre-filled
              // setAveragePlayers(tournament.averagePlayers?.toString() || ''); 
              // setHistoricalData(tournament.historicalData || '');
            }} disabled={isPending}>
              Re-assess with New Data
            </Button>
          )}
          {!assessmentResult && (
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Get AI Risk Assessment
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
