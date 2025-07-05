'use server';

/**
 * @fileOverview A flow that summarizes an AI development description.
 *
 * - summarizeAiDevelopment - A function that summarizes the AI development.
 * - SummarizeAiDevelopmentInput - The input type for the summarizeAiDevelopment function.
 * - SummarizeAiDevelopmentOutput - The return type for the summarizeAiDevelopment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAiDevelopmentInputSchema = z.object({
  description: z.string().describe('The description of the AI development.'),
});
export type SummarizeAiDevelopmentInput = z.infer<typeof SummarizeAiDevelopmentInputSchema>;

const SummarizeAiDevelopmentOutputSchema = z.object({
  summary: z.string().describe('A short summary of the AI development.'),
});
export type SummarizeAiDevelopmentOutput = z.infer<typeof SummarizeAiDevelopmentOutputSchema>;

export async function summarizeAiDevelopment(input: SummarizeAiDevelopmentInput): Promise<SummarizeAiDevelopmentOutput> {
  return summarizeAiDevelopmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAiDevelopmentPrompt',
  input: {schema: SummarizeAiDevelopmentInputSchema},
  output: {schema: SummarizeAiDevelopmentOutputSchema},
  prompt: `You are an AI expert that summarizes AI development in about 20-30 words.

Description: {{{description}}}`,
});

const summarizeAiDevelopmentFlow = ai.defineFlow(
  {
    name: 'summarizeAiDevelopmentFlow',
    inputSchema: SummarizeAiDevelopmentInputSchema,
    outputSchema: SummarizeAiDevelopmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
