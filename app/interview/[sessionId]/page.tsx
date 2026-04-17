import { Metadata } from "next";
import InterviewSuite from "@/components/InterviewSuite";

export const metadata: Metadata = {
  title: "Mock Interview | FlipDAI",
  description: "Conduct a professional mock interview with AI feedback.",
};

interface InterviewPageProps {
  params: {
    sessionId: string;
  };
  searchParams: {
    topic?: string;
    sub?: string;
  };
}

import { DEFAULT_MODEL } from "@/config/flipdai-constants";

export default async function InterviewPage({ params, searchParams }: any) {
  const { sessionId } = await params;
  const resolvedSearchParams = await searchParams;
  const topic = resolvedSearchParams.topic || "General";
  const subcategory = resolvedSearchParams.sub || "Professional Skills";
  const model = resolvedSearchParams.model || DEFAULT_MODEL;

  return (
    <main className="min-h-screen bg-[#0e0f13] text-white">
      <InterviewSuite topic={topic} subcategory={subcategory} model={model} />
    </main>
  );
}
