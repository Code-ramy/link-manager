import { AiInsightsStream } from '@/components/ai-insights-stream';
import { aiDevelopmentsData } from '@/lib/data';
import type { AiDevelopment } from '@/lib/types';
import { summarizeAiDevelopment } from '@/ai/flows/summarize-ai-development';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const developmentsWithSummaries: AiDevelopment[] = await Promise.all(
    aiDevelopmentsData.map(async (dev) => {
      const fullDescription = dev.details.join(' ');
      try {
        const { summary } = await summarizeAiDevelopment({ description: fullDescription });
        return { ...dev, shortDesc: summary };
      } catch (error) {
        console.error("Failed to summarize development:", dev.title, error);
        // Fallback to existing shortDesc if AI fails
        return dev;
      }
    })
  );

  return (
    <div className="app-container">
      <div className="background-shapes"></div>
      <AiInsightsStream developments={developmentsWithSummaries} />
    </div>
  );
}
