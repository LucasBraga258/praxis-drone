"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Card from "@/app/components/ui/Card";
import Link from "next/link";

export default function IntervencaoViewPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const intervencaoId = params.id as string;

  const [intervencao, setIntervencao] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("intervencoes")
        .select(`*, fazendas(id, nome)`)
        .eq("id", intervencaoId)
        .single();
      
      setIntervencao(data);
      setCarregando(false);
    }
    carregar();
  }, [intervencaoId]);

  if (carregando) return (
    <div className="min-h-screen bg-[#07111F] text-emerald-500 flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
    </div>
  );

  if (!intervencao) return (
    <div className="min-h-screen bg-[#07111F] text-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Intervenção não encontrada</h1>
      <button onClick={() => router.back()} className="bg-slate-800 px-6 py-2 rounded-lg">Voltar</button>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Painel Principal */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center bg-[#0F1C30] p-6 rounded-2xl border border-slate-700">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">🧪 {intervencao.tipo || intervencao.praga || "Intervenção"}</h1>
              </div>
              <p className="text-slate-400">
                Fazenda vinculada: <Link href={`/dashboard/fazendas/${intervencao.fazendas?.id}`} className="text-indigo-400 hover:underline">{intervencao.fazendas?.nome}</Link>
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-xs uppercase font-bold">Data Realizada</p>
              <p className="font-bold text-xl">{intervencao.data_intervencao || "-"}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <p className="text-slate-500 text-xs uppercase font-bold tracking-wide">Produto Utilizado</p>
              <h2 className="text-xl font-bold mt-1 text-emerald-400">{intervencao.produto || "Não especificado"}</h2>
            </Card>
            <Card>
              <p className="text-slate-500 text-xs uppercase font-bold tracking-wide">Dose / Dosagem</p>
              <h2 className="text-xl font-bold mt-1">{intervencao.dose || "Não especificada"}</h2>
            </Card>
            <Card>
              <p className="text-slate-500 text-xs uppercase font-bold tracking-wide">Responsável Técnico</p>
              <h2 className="text-xl font-bold mt-1 truncate">{intervencao.responsavel || "Não atribuído"}</h2>
            </Card>
          </div>

          <Card>
            <h2 className="text-xl font-bold mb-4">Relatório e Observações</h2>
            <div className="bg-[#16253D] p-5 rounded-xl border border-slate-700/50 min-h-[150px]">
              {intervencao.observacoes ? (
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{intervencao.observacoes}</p>
              ) : (
                <p className="text-slate-500 italic">Nenhum relatório ou nota técnica cadastrada para esta intervenção.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Painel Lateral (Governança e Ações) */}
        <div className="w-full lg:w-80 space-y-6">
          <Card className="bg-[#0F1C30] border-slate-700">
            <h3 className="font-bold text-lg mb-4 border-b border-slate-700 pb-2">Controles de Acesso</h3>
            <p className="text-sm text-slate-400 mb-6">Apenas usuários com privilégios adequados podem editar ou remover intervenções realizadas.</p>
            
            <div className="flex flex-col gap-3">
              <Link 
                href={`/dashboard/intervencoes/${intervencao.id}/editar`}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
              >
                ✏️ Editar Intervenção
              </Link>
              <Link 
                href={`/dashboard/intervencoes/${intervencao.id}/excluir`}
                className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
              >
                🗑️ Excluir Registro
              </Link>
            </div>
          </Card>

          <button 
            onClick={() => router.back()}
            className="w-full bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-300 py-3 rounded-xl font-medium transition"
          >
            Voltar
          </button>
        </div>

      </div>
    </main>
  );
}
