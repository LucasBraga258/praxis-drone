"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";
import Card from "@/app/components/ui/Card";
import Link from "next/link";
import { toast } from "sonner";

export default function PainelExecutivoIA() {
  const params = useParams();
  const router = useRouter();
  const projetoId = params.id as string;

  const [diagnostico, setDiagnostico] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("diagnosticos_ia")
        .select("*")
        .eq("projeto_id", projetoId)
        .single();
      
      if (data) setDiagnostico(data);
      setCarregando(false);
    }
    carregar();
  }, [projetoId]);

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#07111F] text-white p-8 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Consultando Praxis AI Engine...</p>
        </div>
      </div>
    );
  }

  if (!diagnostico) {
    return (
      <div className="min-h-screen bg-[#07111F] text-white p-8">
        <div className="max-w-2xl mx-auto bg-[#0F1C30] p-12 rounded-2xl border border-slate-700 text-center">
          <div className="text-6xl mb-6">🤖</div>
          <h2 className="text-3xl font-bold mb-4">A IA ainda não analisou esta missão</h2>
          <p className="text-slate-400 mb-8">
            O diagnóstico inteligente será gerado automaticamente quando o processamento em nuvem for concluído.
          </p>
          <button onClick={() => router.back()} className="bg-slate-700 hover:bg-slate-600 px-8 py-3 rounded-xl font-bold transition">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case "Critica": return "text-red-400 bg-red-400/10 border-red-400/30";
      case "Media": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      default: return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
    }
  };

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">
      {/* HUD Superior */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">Painel Executivo de IA</h1>
            <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              Praxis Engine 1.0
            </span>
          </div>
          <p className="text-slate-400">Laudo gerado de forma autônoma sem intervenção humana.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => router.back()} className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-xl transition font-medium">Voltar</button>
          <Link href={`/dashboard/projetos/${projetoId}/relatorio`} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-xl transition font-bold shadow-lg shadow-indigo-900/50">
            Gerar PDF Oficial
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Coluna 1: Diagnóstico Central */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-t-4 border-t-indigo-500">
            <h2 className="text-xl font-bold mb-4 text-slate-300">Resumo Executivo (NLG)</h2>
            <p className="text-lg leading-relaxed">{diagnostico.saude_geral}</p>
          </Card>

          <Card>
            <h2 className="text-xl font-bold mb-6 text-slate-300">Anomalias Detectadas na Vegetação</h2>
            {diagnostico.anomalias_detectadas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-sm">
                      <th className="pb-3">Tipo de Anomalia</th>
                      <th className="pb-3">Severidade</th>
                      <th className="pb-3 text-right">Área Afetada (ha)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnostico.anomalias_detectadas.map((anomalia: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-800/50 last:border-0">
                        <td className="py-4 font-medium">{anomalia.tipo}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(anomalia.severidade === "Alta" ? "Critica" : "Normal")}`}>
                            {anomalia.severidade}
                          </span>
                        </td>
                        <td className="py-4 text-right text-slate-300">{anomalia.area_afetada_ha.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-emerald-400">Nenhuma anomalia severa encontrada.</p>
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-bold mb-4 text-slate-300">Prescrição Técnica Sugerida</h2>
            <div className="bg-[#0F1C30] p-6 rounded-xl border border-slate-700 border-l-4 border-l-emerald-500">
              <p className="text-slate-300 italic">"{diagnostico.recomendacoes_tecnicas}"</p>
            </div>
          </Card>
        </div>

        {/* Coluna 2: Métricas Rápidas */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-sm uppercase font-bold text-slate-400 mb-6">Métricas de Confiança</h2>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Confiabilidade do Modelo</span>
                <span className="text-indigo-400 font-bold">{diagnostico.nivel_confianca}%</span>
              </div>
              <div className="w-full bg-[#0F1C30] rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${diagnostico.nivel_confianca}%` }}></div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Prioridade da Missão</span>
              </div>
              <span className={`inline-block px-4 py-2 rounded-xl text-sm font-bold border ${getPriorityColor(diagnostico.prioridade_geral)}`}>
                Alerta: {diagnostico.prioridade_geral}
              </span>
            </div>
          </Card>

          <Card>
            <h2 className="text-sm uppercase font-bold text-slate-400 mb-6">Distribuição de Vigor (NDVI)</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-400">Alto Vigor</span>
                  <span>{diagnostico.alto_vigor_pct}%</span>
                </div>
                <div className="w-full bg-[#0F1C30] h-3 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full" style={{ width: `${diagnostico.alto_vigor_pct}%` }}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-yellow-400">Médio Vigor</span>
                  <span>{diagnostico.medio_vigor_pct}%</span>
                </div>
                <div className="w-full bg-[#0F1C30] h-3 rounded-full overflow-hidden"><div className="bg-yellow-500 h-full" style={{ width: `${diagnostico.medio_vigor_pct}%` }}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-red-400">Baixo Vigor</span>
                  <span>{diagnostico.baixo_vigor_pct}%</span>
                </div>
                <div className="w-full bg-[#0F1C30] h-3 rounded-full overflow-hidden"><div className="bg-red-500 h-full" style={{ width: `${diagnostico.baixo_vigor_pct}%` }}></div></div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-indigo-900/20 border-indigo-500/30">
            <h2 className="text-sm uppercase font-bold text-indigo-400 mb-4">Automação Realizada</h2>
            <p className="text-sm text-slate-300">A IA detectou a necessidade de tratamento e <strong className="text-white">gerou automaticamente {diagnostico.intervencoes_sugeridas.length} intervenções curativas</strong> no banco de dados aguardando apenas aprovação do Agrônomo.</p>
            <Link href={`/dashboard/projetos/${projetoId}`} className="mt-4 block w-full text-center bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg font-bold transition text-sm">
              Ver Intervenções
            </Link>
          </Card>
        </div>

      </div>
    </main>
  );
}