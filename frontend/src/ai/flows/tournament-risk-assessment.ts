'use server';

/**
 * @fileOverview AI-powered risk assessment for poker tournaments.
 *
 * - assessTournamentRisk - A function that assesses the risk of a poker tournament.
 * - TournamentRiskAssessmentInput - The input type for the assessTournamentRisk function.
 * - TournamentRiskAssessmentOutput - The return type for the assessTournamentRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TournamentRiskAssessmentInputSchema = z.object({
  tournamentName: z.string().describe('The name of the poker tournament.'),
  buyIn: z.number().describe('The buy-in amount for the tournament.'),
  guaranteedPrizePool: z.number().describe('The guaranteed prize pool for the tournament.'),
  averagePlayers: z.number().describe('The average number of players in similar tournaments.'),
  historicalData: z
    .string()
    .describe(
      'Historical data of similar tournaments, including payout structures and player statistics.'
    ),
});
export type TournamentRiskAssessmentInput = z.infer<
  typeof TournamentRiskAssessmentInputSchema
>;

const TournamentRiskAssessmentOutputSchema = z.object({
  riskLevel: z
    .string()
    .describe(
      'The overall risk level of the tournament (e.g., Low, Medium, High).' + 'Consider factors like buy-in, prize pool, and player skill level.'
    ),
  riskFactors: z
    .array(z.string())
    .describe('Specific risk factors associated with the tournament.'),
  investmentRecommendation:
    z.string().describe('A recommendation on whether to invest and at what level.'),
  potentialReturn: z
    .string()
    .describe('An estimate of the potential return on investment.'),
});
export type TournamentRiskAssessmentOutput = z.infer<
  typeof TournamentRiskAssessmentOutputSchema
>;

export async function assessTournamentRisk(
  input: TournamentRiskAssessmentInput
): Promise<TournamentRiskAssessmentOutput> {
  return assessTournamentRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tournamentRiskAssessmentPrompt',
  input: {schema: TournamentRiskAssessmentInputSchema},
  output: {schema: TournamentRiskAssessmentOutputSchema},
  prompt: `You are an AI-powered risk assessment tool for poker tournaments.

You will analyze the tournament data provided and provide a risk assessment, including the risk level, risk factors, investment recommendation, and potential return.

Tournament Name: {{{tournamentName}}}
Buy-In: {{{buyIn}}}
Guaranteed Prize Pool: {{{guaranteedPrizePool}}}
Average Players: {{{averagePlayers}}}
Historical Data: {{{historicalData}}}

Consider the following factors when assessing risk:
- Buy-in amount
- Guaranteed prize pool
- Average number of players
- Historical data of similar tournaments

Provide a clear and concise risk assessment, including specific risk factors and an investment recommendation.

Ensure that the riskLevel is one of "Low", "Medium", or "High".
`,
});

const assessTournamentRiskFlow = ai.defineFlow(
  {
    name: 'assessTournamentRiskFlow',
    inputSchema: TournamentRiskAssessmentInputSchema,
    outputSchema: TournamentRiskAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
