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
  icons: z.array(z.string()).describe('An array of 5-8 relevant icon names from the lucide-react library. The names must be in PascalCase, e.g., "ShoppingCart", "Briefcase", "Gamepad2".'),
});
export type SuggestCategoryIconsOutput = z.infer<typeof SuggestCategoryIconsOutputSchema>;

export async function suggestCategoryIcons(input: SuggestCategoryIconsInput): Promise<SuggestCategoryIconsOutput> {
  return suggestCategoryIconsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCategoryIconsPrompt',
  input: {schema: SuggestCategoryIconsInputSchema},
  output: {schema: SuggestCategoryIconsOutputSchema},
  prompt: `You are a UI/UX expert. Your task is to suggest a list of suitable icon names from the lucide-react library for a given category name.
The icons should be simple, recognizable, and relevant to the category.
Provide 5 to 8 icon names.
The category name is '{{{categoryName}}}'.
Respond ONLY with icon names in PascalCase format. For example, if the category is 'Shopping', you might suggest 'ShoppingCart', 'Store', 'CreditCard'.`,
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
