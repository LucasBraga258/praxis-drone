"use client";

import ReactMarkdown from "react-markdown";
import Card from "@/app/components/ui/Card";
import { SparklesIcon } from "lucide-react";

interface Props {
  markdown?: string | null;
}

export default function MissionAIReport({ markdown }: Props) {
  if (!markdown) return null;

  return (
    <Card className="border border-praxis-green-500/30 bg-praxis-green-900/10 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <SparklesIcon className="text-praxis-green-400 w-6 h-6" />
        <h2 className="text-xl font-bold text-praxis-green-400">Relatório Agronômico (IA Praxis)</h2>
      </div>
      
      <div className="prose prose-invert prose-praxis max-w-none">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </Card>
  );
}
