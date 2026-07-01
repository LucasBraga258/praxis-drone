import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";

export default async function FazendaEvolucaoPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // Busca as comparações dessa fazenda
  const { data: comparacoes } = await supabase
    .from("comparacoes_temporais")
    .select(`
      *,
      talhoes(nome),
      missao_antiga:missao_antiga_id(codigo, data_voo),
      missao_nova:missao_nova_id(codigo, data_voo)
    `)
    .eq("fazenda_id", id)
    .order("data_comparacao", { ascending: false });

  // Busca dados básicos da Fazenda
  const { data: fazenda } = await supabase
    .from("fazendas")
    .select("nome")
    .eq("id", id)
    .single();

  const numComparacoes = comparacoes?.length || 0;
  const areaTotalRecuperada = comparacoes?.reduce((acc, curr) => acc + (curr.delta_area_recuperada_ha || 0), 0) || 0;
  const areaTotalDegradada = comparacoes?.reduce((acc, curr) => acc + (curr.delta_area_degradada_ha || 0), 0) || 0;

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">
      {/* HEADER EXECUTIVO */}
      <div className="flex justify-between items-center mb-8 bg-[#0F1C30] p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-indigo-400">
            Inteligência Temporal Comparativa
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Acompanhe o ROI (Retorno de Investimento) agronômico da {fazenda?.nome}
          </p>
        </div>
        <Link href={`/dashboard/fazendas/${id}`} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-medium transition shadow-md">
          Voltar para Visão Geral
        </Link>
      </div>

      {/* MÉTRICAS MACRO */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-emerald-500">
          <p className="text-slate-400 text-sm">Hectares Recuperados no Ano</p>
          <div className="flex items-end gap-3 mt-2">
            <h2 className="text-4xl font-black text-emerald-400">{areaTotalRecuperada.toFixed(1)}</h2>
            <span className="text-slate-500 mb-1">ha</span>
          </div>
        </Card>
        <Card className="border-l-4 border-red-500">
          <p className="text-slate-400 text-sm">Hectares em Declínio (Risco)</p>
          <div className="flex items-end gap-3 mt-2">
            <h2 className="text-4xl font-black text-red-400">{areaTotalDegradada.toFixed(1)}</h2>
            <span className="text-slate-500 mb-1">ha</span>
          </div>
        </Card>
        <Card className="border-l-4 border-indigo-500">
          <p className="text-slate-400 text-sm">Auditorias Temporais da IA</p>
          <div className="flex items-end gap-3 mt-2">
            <h2 className="text-4xl font-black text-indigo-400">{numComparacoes}</h2>
            <span className="text-slate-500 mb-1">laudos</span>
          </div>
        </Card>
      </div>

      {/* FEED DA INTELIGÊNCIA */}
      <Card>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          🤖 Laudos Gerados pela IA (O tratamento funcionou?)
        </h2>

        {numComparacoes > 0 ? (
          <div className="space-y-6">
            {comparacoes?.map((comp: any) => (
              <div key={comp.id} className="bg-[#0E1B2F] border border-slate-700 p-6 rounded-xl relative overflow-hidden">
                {/* BG Glow Effect */}
                <div className={`absolute -right-20 -top-20 w-48 h-48 opacity-20 blur-3xl rounded-full ${
                  comp.status_evolucao === 'MELHORA' ? 'bg-emerald-500' : 
                  comp.status_evolucao === 'PIORA' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">📍 {comp.talhoes?.nome || "Talhão Desconhecido"}</h3>
                    <p className="text-sm text-slate-400">
                      Comparativo: <span className="text-indigo-300 font-mono">{comp.missao_antiga?.data_voo}</span> vs <span className="text-indigo-300 font-mono">{comp.missao_nova?.data_voo}</span>
                    </p>
                  </div>
                  <Badge color={comp.status_evolucao === 'MELHORA' ? 'green' : comp.status_evolucao === 'PIORA' ? 'red' : 'yellow'}>
                    {comp.status_evolucao}
                  </Badge>
                </div>

                <div className="bg-[#12233D] p-4 rounded-lg border-l-2 border-indigo-500 relative z-10 mb-4">
                  <p className="text-slate-200 leading-relaxed font-medium">
                    "{comp.laudo_texto}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm relative z-10">
                  <div className="bg-[#0A1424] p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-1">Vigor Absoluto Ganho</span>
                    <span className={`font-bold text-lg ${comp.ganho_vigor_percentual > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {comp.ganho_vigor_percentual > 0 ? '+' : ''}{comp.ganho_vigor_percentual}%
                    </span>
                  </div>
                  <div className="bg-[#0A1424] p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-slate-500 block mb-1">Impacto Financeiro (Hectares)</span>
                      <span className="font-bold text-lg text-emerald-400">{comp.delta_area_recuperada_ha} ha salvos</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#0E1B2F] rounded-xl border border-dashed border-slate-700">
            <div className="text-5xl mb-4 opacity-50">⚖️</div>
            <h3 className="text-xl font-bold mb-2">Acervo Vazio</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              A Inteligência ainda não gerou laudos temporais para esta fazenda. 
              Para gerar um comparativo, as rotinas de background precisam cruzar missões antigas com missões novas.
            </p>
          </div>
        )}
      </Card>
    </main>
  );
}
