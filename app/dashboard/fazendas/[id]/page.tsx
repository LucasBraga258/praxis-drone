import Link from "next/link";
import { supabase } from "../../../../lib/supabase";
import HistoricoChart from "./HistoricoChart";


export default async function FazendaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

const { data: fazenda, error } = await supabase
  .from("fazendas")
  .select(`
    *,
    clientes!fazendas_cliente_id_fkey (
      nome
    ),
    agronomos!fazendas_agronomo_id_fkey (
      nome
    ),
    empresas_parceiras!fazendas_empresa_parceira_fkey (
      nome
    )
  `)
  .eq("id", id)
  .single();

  const { data: projetos } = await supabase
    .from("projetos")
    .select("*")
    .eq("fazenda_id", id)
    .order("data_voo", {
      ascending: false,
    });

  if (!fazenda) {
    return (
      <main className="min-h-screen bg-[#07111F] text-white p-8">
        Fazenda não encontrada
      </main>
    );
  }

  const projetosValidos =
    (projetos || []).filter(
      (p) => p.prioridade
    );

  const ultimoProjeto =
    projetosValidos[0];

  const projetoAnterior =
    projetosValidos[1];

  const dadosGrafico =
    [...(projetos || [])]
      .filter(
        (p) =>
          p.alto_vigor ||
          p.medio_vigor ||
          p.baixo_vigor
      )
      .reverse()
      .map((p) => ({
        data: p.data_voo,
        alto: p.alto_vigor || 0,
        medio: p.medio_vigor || 0,
        baixo: p.baixo_vigor || 0,
      }));

  let comparacao = null;

  if (
    ultimoProjeto &&
    projetoAnterior
  ) {
    comparacao = {
      alto:
        (ultimoProjeto.alto_vigor || 0) -
        (projetoAnterior.alto_vigor || 0),

      medio:
        (ultimoProjeto.medio_vigor || 0) -
        (projetoAnterior.medio_vigor || 0),

      baixo:
        (ultimoProjeto.baixo_vigor || 0) -
        (projetoAnterior.baixo_vigor || 0),
    };
  }

  let situacao = null;
  let corSituacao = "";

  if (comparacao) {
    const score =
      comparacao.alto -
      comparacao.baixo;

    if (score >= 5) {
      situacao =
        "Melhora significativa observada em relação ao monitoramento anterior.";

      corSituacao =
        "text-green-400";
    } else if (score <= -5) {
      situacao =
        "Redução do vigor vegetativo observada. Recomenda-se investigação das causas.";

      corSituacao =
        "text-red-400";
    } else {
      situacao =
        "Área estável em relação ao último monitoramento.";

      corSituacao =
        "text-yellow-400";
    }
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">
      
<div className="flex justify-between items-start mb-8">

  

    <h1 className="text-4xl font-bold mb-2">
      {fazenda.nome}
    </h1>

    <p className="text-slate-400">
      Histórico Agronômico
    </p>

    <div className="flex gap-8 mt-5">

  <div>
    <div className="flex gap-8 text-sm mb-8">

  
    <p className="text-slate-400">
      Cliente
    </p>

    <p className="font-semibold">
      {fazenda.clientes?.nome || "-"}
    </p>
  </div>

  <div>
    <p className="text-slate-400">
      Agrônomo
    </p>

    <p className="font-semibold">
      {fazenda.agronomos?.nome || "-"}
    </p>
  </div>

  <div>
    <p className="text-slate-400">
      Empresa
    </p>

    <p className="font-semibold">
      {fazenda.empresas_parceiras?.nome || "-"}
    </p>
  </div>

</div>

  </div>

  <div className="flex gap-2">

    <Link
      href={`/dashboard/fazendas/${fazenda.id}/editar`}
      className="
        bg-[#16253D]
        hover:bg-[#223755]
        w-10
        h-10
        rounded-lg
        flex
        items-center
        justify-center
      "
    >
      ✏️
    </Link>

    <Link
      href={`/dashboard/fazendas/${fazenda.id}/excluir`}
      className="
        bg-[#16253D]
        hover:bg-[#223755]
        w-10
        h-10
        rounded-lg
        flex
        items-center
        justify-center
      "
    >
      🗑️
    </Link>

  </div>

</div>
      
      <div className="grid md:grid-cols-4 gap-4 mb-10">

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">
            Cidade
          </p>

          <h2 className="text-xl font-bold">
            {fazenda.cidade}
          </h2>
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">
            Estado
          </p>

          <h2 className="text-xl font-bold">
            {fazenda.estado}
          </h2>
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">
            Área
          </p>

          <h2 className="text-xl font-bold">
            {fazenda.area_ha} ha
          </h2>
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">
            Próximo Voo
          </p>

          <h2 className="text-xl font-bold text-green-400">
            {fazenda.proximo_voo || "-"}
          </h2>
        </div>

      </div>

      <HistoricoChart
        data={dadosGrafico}
      />

      {situacao && (

        <div className="bg-[#16253D] p-6 rounded-xl mb-6">

          <h2 className="text-2xl font-bold mb-4">
            🧠 Situação Atual
          </h2>

          <p
            className={`text-xl font-semibold ${corSituacao}`}
          >
            {situacao}
          </p>

        </div>

      )}

      {ultimoProjeto?.recomendacoes &&
        Array.isArray(
          ultimoProjeto.recomendacoes
        ) && (

        <div className="bg-[#16253D] p-6 rounded-xl mb-6">

          <h2 className="text-2xl font-bold mb-4">
            📌 Recomendações Atuais
          </h2>

          <ul className="list-disc pl-6 space-y-2">

            {ultimoProjeto.recomendacoes.map(
              (
                item: string,
                index: number
              ) => (

                <li key={index}>
                  {item}
                </li>

              )
            )}

          </ul>

        </div>

      )}

      {comparacao && (

        <div className="bg-[#16253D] p-6 rounded-xl mb-8">

          <h2 className="text-2xl font-bold mb-6">
            📈 Comparação com Voo Anterior
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <div>

              <p className="text-slate-400">
                Alto Vigor
              </p>

              <h3
                className={`text-3xl font-bold ${
                  comparacao.alto >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {comparacao.alto > 0 ? "+" : ""}
                {comparacao.alto}%
              </h3>

            </div>

            <div>

              <p className="text-slate-400">
                Médio Vigor
              </p>

              <h3
                className={`text-3xl font-bold ${
                  comparacao.medio >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {comparacao.medio > 0 ? "+" : ""}
                {comparacao.medio}%
              </h3>

            </div>

            <div>

              <p className="text-slate-400">
                Baixo Vigor
              </p>

              <h3
                className={`text-3xl font-bold ${
                  comparacao.baixo <= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {comparacao.baixo > 0 ? "+" : ""}
                {comparacao.baixo}%
              </h3>

            </div>

          </div>

        </div>

      )}

      <div className="bg-[#16253D] rounded-xl p-6">

        <h2 className="text-2xl font-bold mb-6">
          Histórico de Monitoramentos
        </h2>

        {projetos?.length ? (

          <div className="overflow-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-slate-700">

                  <th className="text-left p-3">Projeto</th>
                  <th className="text-left p-3">Data</th>
                  <th className="text-left p-3">Alto</th>
                  <th className="text-left p-3">Médio</th>
                  <th className="text-left p-3">Baixo</th>
                  <th className="text-left p-3">Prioridade</th>
                  <th className="text-left p-3">Ações</th>

                </tr>

              </thead>

              <tbody>

                {projetos.map((projeto) => (

                  <tr
                    key={projeto.id}
                    className="border-b border-slate-800"
                  >

                    <td className="p-3">
                      {projeto.codigo}
                    </td>

                    <td className="p-3">
                      {projeto.data_voo}
                    </td>

                    <td className="p-3 text-green-400">
                      {projeto.alto_vigor || 0}%
                    </td>

                    <td className="p-3 text-yellow-400">
                      {projeto.medio_vigor || 0}%
                    </td>

                    <td className="p-3 text-red-400">
                      {projeto.baixo_vigor || 0}%
                    </td>

                    <td className="p-3">
                      {projeto.prioridade || "-"}
                    </td>

                    <td className="p-3">

                      <div className="flex gap-2">

                        <Link
                          href={`/dashboard/projetos/${projeto.id}/diagnostico`}
                          className="bg-purple-700 px-3 py-1 rounded"
                        >
                          Diagnóstico
                        </Link>

                        <Link
                          href={`/projetos/${projeto.id}/relatorio`}
                          className="bg-green-700 px-3 py-1 rounded"
                        >
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

          <p>
            Nenhum monitoramento encontrado.
          </p>

        )}

      </div>

    </main>
  );
}