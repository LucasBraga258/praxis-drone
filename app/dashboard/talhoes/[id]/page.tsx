import Link from "next/link";
import { supabase } from "../../../../lib/supabase";
import Card from "@/app/components/ui/Card";

export default async function TalhaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Busca os dados do Talhão e da Fazenda PAI
  const { data: talhao, error } = await supabase
    .from("talhoes")
    .select("*, fazendas(id, nome)")
    .eq("id", id)
    .single();

  if (error || !talhao) {
    return <main className="min-h-screen bg-[#07111F] text-white p-8">Talhão não encontrado.</main>;
  }

  // 2. Busca todas as missões(projetos) filhas deste Talhão
  const { data: missoes } = await supabase
    .from("projetos")
    .select("*")
    .eq("talhao_id", id)
    .order("data_voo", { ascending: false });

  const numMissoes = missoes?.length || 0;
  // @ts-ignore
  const nomeFazenda = talhao.fazendas?.nome || "Fazenda Desconhecida";

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">
      {/* HEADER DA HIERARQUIA */}
      <div className="flex justify-between items-start mb-8 bg-[#0F1C30] p-6 rounded-2xl border border-slate-700">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2 font-medium">
            <Link href="/dashboard/fazendas" className="hover:text-emerald-400 transition">Fazendas</Link>
            <span>/</span>
            {/* @ts-ignore */}
            <Link href={`/dashboard/fazendas/${talhao.fazendas?.id}`} className="hover:text-emerald-400 transition">{nomeFazenda}</Link>
            <span>/</span>
            <span className="text-slate-200">{talhao.nome}</span>
          </div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            🌱 {talhao.nome}
          </h1>
        </div>
        <div className="flex gap-2">
          {/* O botão "Nova Missão" agora nasce daqui e já leva o contexto do Talhão via URL params */}
          <Link 
            href={`/dashboard/projetos/novo?talhaoId=${talhao.id}&fazendaId=${talhao.fazenda_id}`} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition flex items-center gap-2"
          >
            🚁 Agendar Nova Missão
          </Link>
          <Link href={`/dashboard/fazendas/${talhao.fazenda_id}`} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl font-medium transition">
            Voltar
          </Link>
        </div>
      </div>

      {/* MÉTRICAS AGRONÔMICAS */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <p className="text-slate-400 text-sm">Cultura / Safra</p>
          <h2 className="text-xl font-bold">{talhao.cultura || "Não informada"} {talhao.safra ? `(${talhao.safra})` : ""}</h2>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm">Variedade Genética</p>
          <h2 className="text-xl font-bold">{talhao.variedade || "-"}</h2>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm">Área Útil Plantada</p>
          <h2 className="text-xl font-bold">{talhao.area || 0} ha</h2>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm">Total de Missões Executadas</p>
          <h2 className="text-xl font-bold text-emerald-400">{numMissoes}</h2>
        </Card>
      </div>

      {/* HISTÓRICO DE MISSÕES NESTE TALHÃO */}
      <Card>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">🚁 Histórico de Voo (Missões)</h2>
        {numMissoes > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm">
                  <th className="p-4 font-medium">Missão / Código</th>
                  <th className="p-4 font-medium">Data da Coleta</th>
                  <th className="p-4 font-medium">Sensor</th>
                  <th className="p-4 font-medium">Status Pipeline</th>
                  <th className="p-4 font-medium text-right">Acessar Produtos</th>
                </tr>
              </thead>
              <tbody>
                {missoes?.map((missao) => (
                  <tr key={missao.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-medium text-indigo-300">
                      <Link href={`/dashboard/projetos/${missao.id}`} className="hover:underline">
                        {missao.codigo || `Missão #${missao.id}`}
                      </Link>
                    </td>
                    <td className="p-4 text-slate-300">{missao.data_voo}</td>
                    <td className="p-4 text-slate-300 font-medium">
                      {missao.fonte_captura === "Satelite" ? "🛰️ Satélite" : "🚁 Drone"}
                    </td>
                    <td className="p-4">
                      {/* Baseado no status simples para não quebrar. O ideal é ler a tabela mission_jobs futuramente */}
                      <span className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-xs font-bold border border-slate-600">
                        {missao.analise_status || "Concluído"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/dashboard/projetos/${missao.id}/diagnostico`} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">
                          IA
                        </Link>
                        <Link href={`/dashboard/projetos/${missao.id}/mapa`} className="bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">
                          WebGIS
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">Nenhuma missão (voo ou satélite) registrada nesta área.</p>
            <Link href={`/dashboard/projetos/novo?talhaoId=${talhao.id}&fazendaId=${talhao.fazenda_id}`} className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white px-6 py-3 rounded-xl font-bold transition">
              Iniciar Primeira Missão
            </Link>
          </div>
        )}
      </Card>
    </main>
  );
}