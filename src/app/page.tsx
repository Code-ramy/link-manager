import { AiInsightsStream } from '@/components/ai-insights-stream';
import { aiDevelopmentsData } from '@/lib/data';

export default function Home() {
  return (
    <div className="app-container">
      <div className="background-shapes"></div>
      <AiInsightsStream developments={aiDevelopmentsData} />
    </div>
  );
}
