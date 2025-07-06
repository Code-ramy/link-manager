'use server';

/**
 * @fileOverview A flow that suggests icons for a category name.
 *
 * - suggestCategoryIcons - A function that suggests icons.
 * - SuggestCategoryIconsInput - The input type for the suggestCategoryIcons function.
 * - SuggestCategoryIconsOutput - The return type for the suggestCategoryIcons function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCategoryIconsInputSchema = z.object({
  categoryName: z.string().describe('The name of the category for which to suggest icons.'),
});
export type SuggestCategoryIconsInput = z.infer<typeof SuggestCategoryIconsInputSchema>;

const SuggestCategoryIconsOutputSchema = z.object({
  icons: z.array(z.string()).describe('An array of 8-10 highly relevant icon names from the lucide-react library. The names must be in PascalCase, e.g., "ShoppingCart", "Briefcase", "Gamepad2".'),
});
export type SuggestCategoryIconsOutput = z.infer<typeof SuggestCategoryIconsOutputSchema>;

export async function suggestCategoryIcons(input: SuggestCategoryIconsInput): Promise<SuggestCategoryIconsOutput> {
  return suggestCategoryIconsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCategoryIconsPrompt',
  input: {schema: SuggestCategoryIconsInputSchema},
  output: {schema: SuggestCategoryIconsOutputSchema},
  prompt: `You are an expert UI/UX designer specializing in icon selection. Your task is to suggest a list of HIGHLY RELEVANT and commonly used icon names from the lucide-react library for a given category name.
The icons must be simple, universally recognizable, and directly related to the category's meaning.
Provide between 8 and 10 icon names.

Category Name: '{{{categoryName}}}'

RULES:
- Respond ONLY with icon names in PascalCase format.
- Ensure the icons exist in the lucide-react library.
- Prioritize icons that are the most direct representation of the category.

Example for 'Gaming': Gamepad2, Dices, Trophy, Swords, Shield
Example for 'Finance': Wallet, Landmark, PiggyBank, CircleDollarSign, LineChart
Example for 'Work': Briefcase, Building2, Calendar, Target`,
});

const suggestCategoryIconsFlow = ai.defineFlow(
  {
    name: 'suggestCategoryIconsFlow',
    inputSchema: SuggestCategoryIconsInputSchema,
    outputSchema: SuggestCategoryIconsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
