"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import Link from "next/link";

export default function PragaViewPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const pragaId = params.id as string;

  const [praga, setPraga] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarPraga() {
      const { data } = await supabase
        .from("pragas")
        .select(`*, fazendas(id, nome)`)
        .eq("id", pragaId)
        .single();
      
      setPraga(data);
      setCarregando(false);
    }
    carregarPraga();
  }, [pragaId]);

  if (carregando) return (
    <div className="min-h-screen bg-[#07111F] text-yellow-500 flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
    </div>
  );

  if (!praga) return (
    <div className="min-h-screen bg-[#07111F] text-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Praga não encontrada</h1>
      <button onClick={() => router.back()} className="bg-slate-800 px-6 py-2 rounded-lg">Voltar</button>
    </div>
  );

  const getSeverityColor = (nivel: string) => {
    if (nivel === "Alto") return "red";
    if (nivel === "Médio") return "yellow";
    return "green";
  };

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Painel Principal (Conteúdo) */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center bg-[#0F1C30] p-6 rounded-2xl border border-slate-700">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">🐛 {praga.nome}</h1>
                <Badge color={praga.status === 'Resolvido' ? 'green' : 'yellow'}>{praga.status || "Ativo"}</Badge>
              </div>
              <p className="text-slate-400">
                Fazenda vinculada: <Link href={`/dashboard/fazendas/${praga.fazendas?.id}`} className="text-indigo-400 hover:underline">{praga.fazendas?.nome}</Link>
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <p className="text-slate-500 text-xs uppercase font-bold tracking-wide">Nível de Infestação</p>
              <h2 className={`text-2xl font-bold mt-1 text-${getSeverityColor(praga.nivel_infestacao)}-400`}>
                {praga.nivel_infestacao || "Não avaliado"}
              </h2>
            </Card>
            <Card>
              <p className="text-slate-500 text-xs uppercase font-bold tracking-wide">Data de Identificação</p>
              <h2 className="text-2xl font-bold mt-1">{praga.data_identificacao || "-"}</h2>
            </Card>
            <Card>
              <p className="text-slate-500 text-xs uppercase font-bold tracking-wide">Localização GPS</p>
              <h2 className="text-lg font-bold mt-1 truncate">
                {praga.latitude && praga.longitude ? `${praga.latitude}, ${praga.longitude}` : "Coordenadas não salvas"}
              </h2>
            </Card>
          </div>

          <Card>
            <h2 className="text-xl font-bold mb-4">Anotações e Observações</h2>
            <div className="bg-[#16253D] p-5 rounded-xl border border-slate-700/50 min-h-[150px]">
              {praga.observacoes ? (
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{praga.observacoes}</p>
              ) : (
                <p className="text-slate-500 italic">Nenhuma observação técnica cadastrada para esta identificação.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Painel Lateral (Governança e Ações) */}
        <div className="w-full lg:w-80 space-y-6">
          <Card className="bg-[#0F1C30] border-slate-700">
            <h3 className="font-bold text-lg mb-4 border-b border-slate-700 pb-2">Controles de Acesso</h3>
            <p className="text-sm text-slate-400 mb-6">Apenas usuários com privilégios adequados podem alterar estes dados.</p>
            
            <div className="flex flex-col gap-3">
              <Link 
                href={`/dashboard/pragas/${praga.id}/editar`}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
              >
                ✏️ Editar Informações
              </Link>
              <Link 
                href={`/dashboard/pragas/${praga.id}/excluir`}
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
