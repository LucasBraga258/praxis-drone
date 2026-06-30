import Link from "next/link";
import { supabase } from "../../../../lib/supabase";
import HistoricoChart from "./HistoricoChart";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";

export default async function FazendaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: fazenda } = await supabase
    .from("fazendas")
    .select(`*, clientes!fazendas_cliente_id_fkey(nome), agronomos!fazendas_agronomo_id_fkey(nome), empresas_parceiras!fazendas_empresa_parceira_fkey(nome), talhoes(*)`)
    .eq("id", id)
    .single();

  const { data: projetos } = await supabase
    .from("projetos")
    .select("*")
    .eq("fazenda_id", id)
    .order("data_voo", { ascending: false });

  const { data: intervencoes } = await supabase
    .from("intervencoes")
    .select("*")
    .eq("fazenda_id", id)
    .order("data_intervencao", { ascending: false });

  const { data: pragas } = await supabase
    .from("pragas")
    .select("*")
    .eq("fazenda_id", id)
    .order("data_identificacao", { ascending: false });

  if (!fazenda) {
    return <main className="min-h-screen bg-[#07111F] text-white p-8">Fazenda não encontrada</main>;
  }

  const timeline = [
    ...(projetos || []).filter((p) => p.alto_vigor || p.medio_vigor || p.baixo_vigor).map((p) => ({
      tipo: "monitoramento", data: p.data_voo, item: p,
    })),
    ...(intervencoes || []).map((i) => ({
      tipo: "intervencao", data: i.data_intervencao, item: i,
    })),
  ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const projetosValidos = (projetos || []).filter((p) => p.prioridade);
  const ultimoProjeto = projetosValidos[0];
  const projetoAnterior = projetosValidos[1];

  const dadosGrafico = [...(projetos || [])]
    .filter((p) => p.alto_vigor || p.medio_vigor || p.baixo_vigor)
    .reverse()
    .map((p) => ({
      data: p.data_voo, alto: p.alto_vigor || 0, medio: p.medio_vigor || 0, baixo: p.baixo_vigor || 0,
    }));

  let comparacao = null;
  let situacao = null;
  let corSituacao = "";

  if (ultimoProjeto && projetoAnterior) {
    comparacao = {
      alto: (ultimoProjeto.alto_vigor || 0) - (projetoAnterior.alto_vigor || 0),
      medio: (ultimoProjeto.medio_vigor || 0) - (projetoAnterior.medio_vigor || 0),
      baixo: (ultimoProjeto.baixo_vigor || 0) - (projetoAnterior.baixo_vigor || 0),
    };
    const score = comparacao.alto - comparacao.baixo;
    if (score >= 5) {
      situacao = "Melhora significativa observada em relação ao monitoramento anterior.";
      corSituacao = "text-emerald-400";
    } else if (score <= -5) {
      situacao = "Redução do vigor vegetativo observada. Recomenda-se investigação das causas.";
      corSituacao = "text-red-400";
    } else {
      situacao = "Área estável em relação ao último monitoramento.";
      corSituacao = "text-yellow-400";
    }
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8 bg-[#0F1C30] p-6 rounded-2xl border border-slate-700">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">{fazenda.nome}</h1>
          <div className="flex gap-6 mt-4 text-sm">
            <div>
              <p className="text-slate-500 uppercase tracking-wide text-xs">Cliente</p>
              <p className="font-semibold">{fazenda.clientes?.nome || "-"}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wide text-xs">Agrônomo</p>
              <p className="font-semibold">{fazenda.agronomos?.nome || "-"}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wide text-xs">Empresa</p>
              <p className="font-semibold">{fazenda.empresas_parceiras?.nome || "-"}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/fazendas/${fazenda.id}/evolucao`} className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white px-5 py-2 rounded-lg font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-900/20">
            📈 Inteligência Temporal
          </Link>
          <Link href={`/dashboard/fazendas/${fazenda.id}/editar`} className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2">
            ✏️ Editar
          </Link>
          <Link href={`/dashboard/fazendas/${fazenda.id}/excluir`} className="bg-red-900/20 hover:bg-red-900/40 text-red-400 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2">
            🗑️ Excluir
          </Link>
        </div>
      </div>

      {/* TALHÕES DA FAZENDA (Hierarquia) */}
      <Card className="mb-8 border-l-4 border-emerald-500">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">🌱 Talhões / Glebas</h2>
            <p className="text-sm text-slate-400 mt-1">Selecione uma área para visualizar ou agendar novas missões de voo.</p>
          </div>
          <Link href="/dashboard/talhoes/novo" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition">
            + Novo Talhão
          </Link>
        </div>
        
        {fazenda.talhoes && fazenda.talhoes.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {fazenda.talhoes.map((talhao: any) => (
              <Link key={talhao.id} href={`/dashboard/talhoes/${talhao.id}`} className="block bg-[#0E1B2F] border border-slate-700 hover:border-emerald-500 hover:bg-[#12233D] p-5 rounded-xl transition group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-emerald-100 group-hover:text-emerald-400 transition-colors">{talhao.nome}</h3>
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-md">{talhao.area || 0} ha</span>
                </div>
                <p className="text-sm text-slate-400">Cultura: <span className="text-white font-medium">{talhao.cultura || "N/A"}</span></p>
                <div className="mt-4 text-xs font-bold text-indigo-400 flex items-center gap-1 group-hover:text-indigo-300">
                  Acessar Central do Talhão →
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-6">Nenhum talhão cadastrado para esta fazenda.</p>
        )}
      </Card>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <p className="text-slate-400 text-sm">Cidade / Estado</p>
          <h2 className="text-xl font-bold">{fazenda.cidade} - {fazenda.estado}</h2>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm">Área Total</p>
          <h2 className="text-xl font-bold">{fazenda.area_ha} ha</h2>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm">Próximo Voo</p>
          <h2 className="text-xl font-bold text-emerald-400">{fazenda.proximo_voo || "-"}</h2>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm">Total Monitoramentos</p>
          <h2 className="text-xl font-bold text-indigo-400">{projetos?.length || 0}</h2>
        </Card>
      </div>

      {/* SITUATION & COMPARISON */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {situacao && (
          <Card className="flex flex-col justify-center">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🧠 Situação da IA</h2>
            <p className={`text-lg font-medium ${corSituacao}`}>{situacao}</p>
          </Card>
        )}
        
        {comparacao && (
          <Card>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">📈 Comparação de Vigor</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-slate-400 text-sm">Alto</p>
                <h3 className={`text-2xl font-bold ${comparacao.alto >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {comparacao.alto > 0 ? "+" : ""}{comparacao.alto}%
                </h3>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Médio</p>
                <h3 className={`text-2xl font-bold ${comparacao.medio >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {comparacao.medio > 0 ? "+" : ""}{comparacao.medio}%
                </h3>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Baixo</p>
                <h3 className={`text-2xl font-bold ${comparacao.baixo <= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {comparacao.baixo > 0 ? "+" : ""}{comparacao.baixo}%
                </h3>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* CHART */}
      {dadosGrafico.length > 0 && (
        <div className="mb-8">
          <HistoricoChart data={dadosGrafico} />
        </div>
      )}

      {/* DETAILED TABLES / CARDS */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        
        {/* INTERVENTIONS */}
        <Card className="flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">🧪 Intervenções (Ação Realizada)</h2>
            <Link href="/dashboard/intervencoes/novo" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition">
              + Adicionar
            </Link>
          </div>
          <div className="space-y-3 flex-1">
            {intervencoes?.length ? (
              intervencoes.map((item) => (
                <Link key={item.id} href={`/dashboard/intervencoes/${item.id}`} className="block bg-[#0E1B2F] border border-slate-700/50 hover:border-emerald-500/50 hover:bg-[#12233D] p-4 rounded-xl transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-emerald-100 group-hover:text-emerald-400 transition-colors">{item.tipo || "Tratamento"}</h3>
                    <span className="text-xs text-slate-500 font-mono">{item.data_intervencao}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                    <p><span className="text-slate-500">Produto:</span> {item.produto || "-"}</p>
                    <p><span className="text-slate-500">Dose:</span> {item.dose || "-"}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-slate-500 text-center py-6">Nenhuma intervenção registrada.</p>
            )}
          </div>
        </Card>

        {/* PESTS */}
        <Card className="flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">🐛 Pragas & Doenças (Detecção)</h2>
            <Link href="/dashboard/pragas/novo" className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition">
              + Relatar
            </Link>
          </div>
          <div className="space-y-3 flex-1">
            {pragas?.length ? (
              pragas.map((praga) => (
                <Link key={praga.id} href={`/dashboard/pragas/${praga.id}`} className="block bg-[#0E1B2F] border border-slate-700/50 hover:border-yellow-500/50 hover:bg-[#12233D] p-4 rounded-xl transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-yellow-100 group-hover:text-yellow-400 transition-colors">{praga.nome}</h3>
                    <span className="text-xs text-slate-500 font-mono">{praga.data_identificacao}</span>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <Badge color={praga.nivel_infestacao === 'Alto' ? 'red' : praga.nivel_infestacao === 'Médio' ? 'yellow' : 'green'}>
                      Nível: {praga.nivel_infestacao}
                    </Badge>
                    <Badge color={praga.status === 'Resolvido' ? 'green' : 'yellow'}>
                      {praga.status}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-slate-500 text-center py-6">Nenhuma praga ou doença relatada.</p>
            )}
          </div>
        </Card>
      </div>

      {/* MONITORING HISTORY */}
      <Card>
        <h2 className="text-2xl font-bold mb-6">🚁 Histórico de Monitoramentos</h2>
        {projetos?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm">
                  <th className="p-4 font-medium">Projeto (Missão)</th>
                  <th className="p-4 font-medium">Data Voo</th>
                  <th className="p-4 font-medium text-emerald-500">Alto Vigor</th>
                  <th className="p-4 font-medium text-yellow-500">Médio Vigor</th>
                  <th className="p-4 font-medium text-red-500">Baixo Vigor</th>
                  <th className="p-4 font-medium text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody>
                {projetos.map((projeto) => (
                  <tr key={projeto.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-medium text-indigo-300">
                      <Link href={`/dashboard/projetos/${projeto.id}`} className="hover:underline">
                        {projeto.codigo}
                      </Link>
                    </td>
                    <td className="p-4 text-slate-300">{projeto.data_voo}</td>
                    <td className="p-4 text-emerald-400 font-medium">{projeto.alto_vigor || 0}%</td>
                    <td className="p-4 text-yellow-400 font-medium">{projeto.medio_vigor || 0}%</td>
                    <td className="p-4 text-red-400 font-medium">{projeto.baixo_vigor || 0}%</td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/dashboard/projetos/${projeto.id}/diagnostico`} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">
                          IA
                        </Link>
                        <Link href={`/dashboard/projetos/${projeto.id}/mapa`} className="bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">
                          Mapa
                        </Link>
                        <Link href={`/dashboard/projetos/${projeto.id}/relatorio`} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">
                          Relatório
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 py-6 text-center">Nenhum monitoramento encontrado para esta fazenda.</p>
        )}
      </Card>

    </main>
  );
}