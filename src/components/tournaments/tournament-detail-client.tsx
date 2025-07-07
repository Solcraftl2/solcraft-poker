
"use client";

import { useState, useTransition } from "react";
import { TournamentDetailHeader } from "@/components/tournaments/tournament-detail-header";
import { InvestmentTierCard } from "@/components/tournaments/investment-tier-card";
import { AiRiskAssessmentSection } from "@/components/tournaments/ai-risk-assessment-section";
import { InvestDialog, type InvestmentDetails } from "@/components/tournaments/invest-dialog";
import { mockInvestmentTiers } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Info, DollarSign, MessageCircle, Layers3, AlertCircle, TrendingUp, BarChartHorizontalBig, Check, ShieldCheck, Lock, HeartHandshake, BookCheck, FileText, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Tournament, InvestmentTier } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { makeInvestment } from "@/lib/actions/investment.actions";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";


interface TournamentDetailClientProps {
    tournament: Tournament;
}

export function TournamentDetailClient({ tournament }: TournamentDetailClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isInvestDialogOpen, setIsInvestDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentDetails | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  const handleInvestment = (tier: InvestmentTier) => {
    if (!auth.currentUser) {
        toast({ title: "Authentication Required", description: "Please log in to make an investment.", variant: "destructive" });
        router.push('/login');
        return;
    }
    setSelectedInvestment({
      tournamentName: tournament.name,
      tournamentId: tournament.id,
      tierName: tier.name,
      minInvestment: tier.minInvestmentCurrency,
      maxInvestment: tier.maxInvestmentCurrency,
      tokenTicker: tournament.tokenizationDetails?.tokenTicker || 'Tokens',
    });
    setIsInvestDialogOpen(true);
  };

  const handleConfirmInvestment = (amount: number) => {
     if (!auth.currentUser || !selectedInvestment) return;
     
     const investmentDetails = {
        tournamentId: selectedInvestment.tournamentId,
        tournamentName: selectedInvestment.tournamentName,
        tierName: selectedInvestment.tierName,
        amount: amount,
        tokenAmount: amount / (tournament.tokenizationDetails?.tokenPrice || 1), // Assuming price, default to 1
     };

     startTransition(async () => {
        const result = await makeInvestment(auth.currentUser!.uid, investmentDetails);
        if (result.success) {
            toast({
                title: "Investment Successful!",
                description: `Your investment of $${amount.toLocaleString()} in the ${selectedInvestment?.tierName} tier has been recorded.`,
            });
        } else {
            toast({
                title: "Investment Failed",
                description: result.message,
                variant: "destructive",
            });
        }
        setIsInvestDialogOpen(false);
        setSelectedInvestment(null);
     });
  }

  const isTokenizedAndDetailsExist = tournament.tokenizationDetails?.isTokenized && tournament.tokenizationDetails;
  const tokenTicker = tournament.tokenizationDetails?.tokenTicker || "Tokens";

  return (
    <>
      <div className="container mx-auto py-8">
        <TournamentDetailHeader tournament={tournament} />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-6">
            <TabsTrigger value="overview"><Info className="mr-2 h-4 w-4 sm:inline hidden" />Overview</TabsTrigger>
            <TabsTrigger value="invest"><DollarSign className="mr-2 h-4 w-4 sm:inline hidden" />Invest</TabsTrigger>
            <TabsTrigger value="tokenization"><Layers3 className="mr-2 h-4 w-4 sm:inline hidden" />Tokenization</TabsTrigger>
            <TabsTrigger value="ai-risk"><Trophy className="mr-2 h-4 w-4 sm:inline hidden" />AI Risk</TabsTrigger>
            <TabsTrigger value="security-trust"><ShieldCheck className="mr-2 h-4 w-4 sm:inline hidden" />Security</TabsTrigger>
            <TabsTrigger value="community"><MessageCircle className="mr-2 h-4 w-4 sm:inline hidden" />Community</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Tournament Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{tournament.description || "Detailed description not available."}</p>

                {tournament.isCompleted && typeof tournament.prizeWon !== 'undefined' && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-md mt-4">
                    <h3 className="font-semibold text-green-700 dark:text-green-400 flex items-center">
                      <Check className="h-5 w-5 mr-2" />
                      Tournament Completed!
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                      Total Prize Awarded: ${tournament.prizeWon.toLocaleString()}
                    </p>
                  </div>
                )}

                <Separator />
                <h3 className="font-semibold text-lg">Key Details</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><span className="font-medium text-foreground">Platform:</span> {tournament.platform}</li>
                  <li><span className="font-medium text-foreground">Game Type:</span> Texas Hold'em (Assumed)</li>
                  <li><span className="font-medium text-foreground">Structure:</span> Standard Payout (Assumed)</li>
                  {tournament.participants?.max && <li><span className="font-medium text-foreground">Max Participants:</span> {tournament.participants.max}</li>}
                  <li>
                    <span className="font-medium text-foreground">Start Time:</span> {format(parseISO(tournament.startTime), "MMM d, yyyy 'at' p")}
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Status:</span> {tournament.status}
                  </li>
                </ul>
                <Button variant="outline" disabled>View Full Rules (Coming Soon)</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invest">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Investment Tiers</CardTitle>
                <CardDescription>
                  Choose an investment level that matches your risk appetite and goals.
                  Platform fees (detailed on each tier) apply to your share of any winnings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mockInvestmentTiers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockInvestmentTiers.map((tier) => (
                      <InvestmentTierCard
                        key={tier.id}
                        tier={tier}
                        onInvest={() => handleInvestment(tier)}
                        tokenTicker={tokenTicker}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No investment tiers available for this tournament yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tokenization">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center">
                <Layers3 className="mr-2 h-6 w-6 text-primary" />
                Tournament Tokenization
              </CardTitle>
              <CardDescription>
                Details about how this tournament's buy-in is tokenized for investment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isTokenizedAndDetailsExist && tournament.tokenizationDetails ? (
                <>
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-md">
                    <h3 className="font-semibold text-green-700 dark:text-green-400">This tournament is tokenized!</h3>
                    <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                      You can invest in fractions of the player's buy-in by purchasing tournament tokens.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-foreground flex items-center">
                      <BarChartHorizontalBig className="mr-2 h-5 w-5 text-primary" />
                      Token Fractionalization
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Token Ticker:</p>
                        <p className="font-semibold text-foreground">{tournament.tokenizationDetails.tokenTicker}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Total Token Supply:</p>
                        <p className="font-semibold text-foreground">{tournament.tokenizationDetails.totalTokenSupply.toLocaleString()} tokens</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Equivalent Total Buy-in (Tokenized):</p>
                        <p className="font-semibold text-foreground">${(tournament.tokenizationDetails.totalTokenSupply * tournament.tokenizationDetails.tokenPrice).toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Original Tournament Buy-in:</p>
                        <p className="font-semibold text-foreground">${tournament.buyIn.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Minimum Investment:</p>
                        <p className="font-semibold text-foreground">
                          {tournament.tokenizationDetails.minInvestmentTokens.toLocaleString()} tokens
                          (${(tournament.tokenizationDetails.minInvestmentTokens * tournament.tokenizationDetails.tokenPrice).toLocaleString()})
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Maximum Investment (per investor):</p>
                        <p className="font-semibold text-foreground">
                          {tournament.tokenizationDetails.maxInvestmentTokens.toLocaleString()} tokens
                          (${(tournament.tokenizationDetails.maxInvestmentTokens * tournament.tokenizationDetails.tokenPrice).toLocaleString()})
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-foreground flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                      Token Economics
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Initial Token Price:</p>
                        <p className="font-semibold text-foreground">${tournament.tokenizationDetails.tokenPrice.toFixed(2)} per {tournament.tokenizationDetails.tokenTicker}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Valuation Basis:</p>
                        <p className="font-semibold text-foreground">
                          {`$${tournament.buyIn.toLocaleString()} (Buy-in) / ${tournament.tokenizationDetails.totalTokenSupply.toLocaleString()} ${tournament.tokenizationDetails.tokenTicker} (Supply)`}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      Note: The initial token price is fixed. During live tournaments, token valuation may fluctuate based on player performance and market dynamics on potential future secondary markets. Post-tournament, the final value per token will be determined by actual prize winnings, net of platform fees.
                    </p>
                  </div>

                  <Separator />
                  <div>
                    <h4 className="font-semibold text-md mb-2">How Tokenization Works:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Each tournament buy-in can be represented by a set number of tokens.</li>
                      <li>Investors purchase these tokens to collectively fund a player's entry.</li>
                      <li>If the player wins, profits (after platform fees) are distributed proportionally to token holders.</li>
                      <li>If the tournament is not fully funded via tokens, investments may be refunded (specific logic TBD).</li>
                      <li>Tokens may become tradable on a secondary market, allowing for dynamic valuation during the tournament (feature TBD).</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-md flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-700 dark:text-amber-400">Not Currently Tokenized</h3>
                    <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                      This tournament is not set up for tokenized investment at this time.
                      Traditional staking or backing methods may be available elsewhere if applicable.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="ai-risk">
            <AiRiskAssessmentSection tournament={tournament} initialAssessment={tournament.aiRiskAssessment} />
          </TabsContent>

          <TabsContent value="security-trust">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center">
                <ShieldCheck className="mr-2 h-6 w-6 text-primary" />
                Security, Trust & Compliance
              </CardTitle>
              <CardDescription>
                SolCraft employs robust systems to ensure fair play, security of investments, and regulatory adherence.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-foreground flex items-center">
                  <Lock className="mr-2 h-5 w-5 text-primary" />
                  Escrow System
                </h3>
                <p className="text-sm text-muted-foreground">
                  Investor funds are securely held in a multi-signature smart contract escrow. Funds for the tournament buy-in are released to the player only upon verification of tournament registration. Winnings are distributed automatically to token holders based on proportional ownership after the tournament concludes and results are verified.
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground pl-4">
                  <li>Multi-signature contracts for enhanced security.</li>
                  <li>Time-locked features for dispute resolution (future).</li>
                  <li>Transparent audit trail of all transactions.</li>
                </ul>
              </div>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-foreground flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Player Guarantee & Deposit System
                </h3>
                <p className="text-sm text-muted-foreground">
                  To ensure accountability, players may be required to provide a guarantee deposit. The deposit amount can vary based on the player's ranking and historical performance on the platform. This system helps protect investors in case of a player failing to deliver winnings or engaging in misconduct.
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground pl-4">
                  <li>Deposit requirements are higher for new or unverified players.</li>
                  <li>Deposits may be partially or fully forfeited under specific conditions (e.g., non-delivery of prize, cheating).</li>
                  <li>Successful prize delivery leads to deposit return and potential ranking improvement for the player.</li>
                </ul>
              </div>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-foreground flex items-center">
                  <HeartHandshake className="mr-2 h-5 w-5 text-primary" />
                  Optional Investment Insurance (Future Feature)
                </h3>
                <p className="text-sm text-muted-foreground">
                  SolCraft plans to integrate optional insurance for investments. For a small premium, investors may be able to protect their stake against certain risks, such as player disqualification or unforeseen technical issues affecting the tournament. This feature aims to provide an additional layer of security for investors.
                </p>
              </div>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-foreground flex items-center">
                  <BookCheck className="mr-2 h-5 w-5 text-primary" />
                  Tournament Result Verification
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tournament outcomes are verified through multiple independent data sources and, where possible, on-chain data. We utilize oracle services to ensure the integrity and accuracy of reported results, forming the basis for transparent prize distribution. A dispute resolution mechanism is planned for addressing any discrepancies.
                </p>
              </div>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-foreground flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  Regulatory Compliance
                </h3>
                <p className="text-sm text-muted-foreground">
                  SolCraft is committed to operating in compliance with applicable regulations. This may include KYC/AML (Know Your Customer/Anti-Money Laundering) procedures for users engaging in significant financial activities, verification for accredited investors for certain high-tier investment opportunities, and adherence to geographic restrictions. We aim to provide tools to assist with tax reporting where feasible.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="community">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Community Discussion</CardTitle>
                <CardDescription>See what others are saying about this tournament.</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium text-muted-foreground">Community features coming soon!</p>
                <p className="text-sm text-muted-foreground">Discuss strategies, share insights, and connect with other investors.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {selectedInvestment && (
        <InvestDialog
            open={isInvestDialogOpen}
            onOpenChange={setIsInvestDialogOpen}
            details={selectedInvestment}
            onConfirm={handleConfirmInvestment}
            isProcessing={isSubmitting}
        />
      )}
    </>
  );
}
