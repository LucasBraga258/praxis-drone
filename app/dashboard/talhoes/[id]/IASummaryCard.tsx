"use client";

import { useEffect, useState } from "react";
import Card from "@/app/components/ui/Card";
import { toast } from "sonner";

interface IASummaryCardProps {
  talhaoId: number;
}

export default function IASummaryCard({ talhaoId }: IASummaryCardProps) {
  const [analise, setAnalise] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function fetchAnalise() {
      try {
        const res = await fetch("/api/analisar-temporal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ talhaoId }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setAnalise(data.analise);
        } else {
          const errData = await res.text();
          console.error("Erro da API:", res.status, errData);
          toast.error(`Falha ao gerar inteligência temporal: ${res.status}`);
        }
      } catch (err) {
        console.error("Erro ao puxar IA:", err);
      } finally {
        setCarregando(false);
      }
    }
    
    fetchAnalise();
  }, [talhaoId]);

  if (carregando) {
    return (
      <Card className="mb-6 border border-slate-700 bg-[#0A1628] animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-slate-700 rounded w-full"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!analise) return null;

  const corStatus = analise.saudeGeral === "Crítica" ? "#ef4444" : 
                    analise.saudeGeral === "Atenção" ? "#f59e0b" : "#22c55e";

  return (
    <Card className="mb-6 relative overflow-hidden" style={{ border: `1px solid ${corStatus}40` }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: corStatus }}></div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            🧠 Resumo Executivo da IA
          </h2>
          <p className="text-xs text-slate-400 mt-1">Análise temporal (Satélite + Drone + Sensores)</p>
        </div>
        <span style={{ background: `${corStatus}20`, color: corStatus, padding: "4px 12px", borderRadius: 999, fontWeight: 700, fontSize: 13 }}>
          {analise.saudeGeral}
        </span>
      </div>

      <p className="text-slate-300 text-sm leading-relaxed mb-4">
        {analise.resumo}
      </p>

      {analise.recomendacoes && analise.recomendacoes.length > 0 && (
        <div className="bg-[#07111F] p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recomendações:</h3>
          <ul className="flex flex-col gap-2">
            {analise.recomendacoes.map((rec: string, i: number) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✔</span> {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
