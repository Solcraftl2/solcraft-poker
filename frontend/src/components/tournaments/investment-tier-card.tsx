
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { InvestmentTier } from "@/lib/types";
import { CheckCircle, TrendingUp, DollarSign, Zap, Gem, Star, Award, Percent, Library } from "lucide-react";
import { riskLevelColorMap, riskLevelIconMap, priorityIconMap } from "@/lib/mock-data";

interface InvestmentTierCardProps {
  tier: InvestmentTier;
  onInvest: (tier: InvestmentTier) => void;
  tokenTicker?: string;
}

export function InvestmentTierCard({ tier, onInvest, tokenTicker = "Tokens" }: InvestmentTierCardProps) {
  const RiskIcon = riskLevelIconMap[tier.riskLevel];
  const PriorityIcon = tier.priorityDescription ? priorityIconMap[tier.priorityDescription as keyof typeof priorityIconMap] || Library : Library;

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-lg">{tier.name}</CardTitle>
          <Badge variant="outline" className={`border-2 ${
              tier.riskLevel === 'Low' ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' :
              tier.riskLevel === 'Medium' ? 'border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400'
            }`}>
            <RiskIcon className={`h-4 w-4 mr-1 ${riskLevelColorMap[tier.riskLevel]}`} />
            {tier.riskLevel} Risk
          </Badge>
        </div>
        <CardDescription>{tier.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <div className="flex items-center text-sm mb-1">
            <DollarSign className="h-4 w-4 mr-2 text-primary" />
            <span>
              Investment: ${tier.minInvestmentCurrency.toLocaleString()}
              {tier.maxInvestmentCurrency ? ` - $${tier.maxInvestmentCurrency.toLocaleString()}` : '+'}
            </span>
          </div>
          {tier.minInvestmentTokens > 0 && (
            <p className="text-xs text-muted-foreground ml-6">
                ({tier.minInvestmentTokens.toLocaleString()} {tokenTicker}
                {tier.maxInvestmentTokens ? ` - ${tier.maxInvestmentTokens.toLocaleString()} ${tokenTicker}` : '+'})
            </p>
          )}
        </div>

        <div className="flex items-center text-sm">
          <Percent className="h-4 w-4 mr-2 text-primary" />
          <span>Platform Fee: {tier.platformFeePercentage}% on winnings</span>
        </div>

        <div className="flex items-center text-sm">
          <TrendingUp className="h-4 w-4 mr-2 text-primary" />
          <span>Potential Return: {tier.potentialReturn}</span>
        </div>

        {tier.priorityDescription && (
          <div className="flex items-center text-sm">
            <PriorityIcon className="h-4 w-4 mr-2 text-primary" />
            <span>{tier.priorityDescription}</span>
          </div>
        )}

        {tier.benefits.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1 mt-2">Key Benefits:</h4>
            <ul className="space-y-1">
              {tier.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start text-xs">
                  <CheckCircle className="h-3.5 w-3.5 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => onInvest(tier)} variant="default">
          Invest in {tier.name}
        </Button>
      </CardFooter>
    </Card>
  );
}
