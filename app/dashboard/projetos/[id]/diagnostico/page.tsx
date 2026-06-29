import { supabase } from "../../../../../lib/supabase";
import GerarRelatorioButton from "./GerarRelatorioButton";
import AnalisarImagensButton from "./AnalisarImagensButton";

export default async function DiagnosticoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: projeto } = await supabase
    .from("projetos")
    .select(`
      *,
      fazendas (
        nome
      )
    `)
    .eq("id", id)
    .single();

    const { data: arquivos } = await supabase
  .from("arquivos_projeto")
  .select("*")
  .eq("projeto_id", id);

  const quantidadeFotos =
  arquivos?.filter(
    (a) => a.tipo === "foto"
  ).length || 0;

const tamanhoTotal =
  arquivos
    ?.filter((a) => a.tipo === "foto")
    .reduce(
      (acc, a) => acc + Number(a.tamanho || 0),
      0
    ) || 0;

const ultimoUpload =
  arquivos?.length
    ? arquivos
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )[0]
    : null;

  if (!projeto) {
    return (
      <main className="min-h-screen bg-[#07111F] text-white p-10">
        Projeto não encontrado
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-2">
        Diagnóstico Técnico
      </h1>

      <p className="text-slate-400 mb-8">
        Projeto {projeto.codigo}
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">Fazenda</p>
          <h2 className="text-2xl font-bold">
            {projeto.fazendas?.nome}
          </h2>
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">Área Mapeada</p>
          <h2 className="text-2xl font-bold">
            {projeto.area_mapeada} ha
          </h2>
        </div>

      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">Alto Vigor</p>
          <h2 className="text-3xl font-bold text-green-400">
            {projeto.alto_vigor || 0}%
          </h2>
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">Médio Vigor</p>
          <h2 className="text-3xl font-bold text-yellow-400">
            {projeto.medio_vigor || 0}%
          </h2>
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">Baixo Vigor</p>
          <h2 className="text-3xl font-bold text-red-400">
            {projeto.baixo_vigor || 0}%
          </h2>
        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">Elevação Mínima</p>
          <h2 className="text-2xl font-bold">
            {projeto.elevacao_min ?? "-"}
          </h2>
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">Elevação Máxima</p>
          <h2 className="text-2xl font-bold">
            {projeto.elevacao_max ?? "-"}
          </h2>
        </div>

      </div>

      <div className="bg-[#16253D] p-6 rounded-xl mb-8">

        <h2 className="text-2xl font-bold mb-4">
          Observações
        </h2>

        <p className="whitespace-pre-wrap">
          {projeto.observacoes || "Nenhuma observação cadastrada."}
        </p>

      </div>
     <div className="grid md:grid-cols-3 gap-4 mb-8">

  <div className="bg-[#16253D] p-6 rounded-xl">

    <h2 className="text-xl font-bold mb-3">
      Prioridade
    </h2>

    <div
      className={`text-5xl font-bold ${
        projeto.prioridade === "Alta"
          ? "text-red-400"
          : projeto.prioridade === "Média"
          ? "text-yellow-400"
          : "text-green-400"
      }`}
    >
      {projeto.prioridade || "-"}
    </div>

  </div>

  <div className="bg-[#16253D] p-6 rounded-xl">

    <h2 className="text-xl font-bold mb-3">
      Próximo Monitoramento
    </h2>

    <div className="text-5xl font-bold text-cyan-400">
      {projeto.proximo_voo_recomendado || "-"}
    </div>

    <p className="text-slate-400 mt-2">
      dias
    </p>

  </div>

  <div className="bg-[#16253D] p-6 rounded-xl">

    <h2 className="text-xl font-bold mb-3">
      Recomendações
    </h2>

    {projeto.recomendacoes &&
    Array.isArray(projeto.recomendacoes) ? (

      <ul className="list-disc pl-6 space-y-2">

        {projeto.recomendacoes.map(
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

    ) : (

      <p>
        Nenhuma recomendação disponível.
      </p>

    )}

  </div>

</div>



      <div className="bg-[#16253D] p-6 rounded-xl mb-8">

        <h2 className="text-2xl font-bold mb-6">
          Imagens da Análise
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div>
            <h3 className="font-semibold mb-3">
              Ortomosaico RGB
            </h3>

            {projeto.ortomosaico_img_url ? (
              <img
                src={projeto.ortomosaico_img_url}
                alt="Ortomosaico"
                className="rounded-xl border border-slate-700"
              />
            ) : (
              <p className="text-slate-500">
                Não enviado
              </p>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-3">
              VARI / NDVI
            </h3>

            {projeto.ndvi_img_url ? (
              <img
                src={projeto.ndvi_img_url}
                alt="VARI"
                className="rounded-xl border border-slate-700"
              />
            ) : (
              <p className="text-slate-500">
                Não enviado
              </p>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-3">
              Elevação
            </h3>

            {projeto.elevacao_img_url ? (
              <img
                src={projeto.elevacao_img_url}
                alt="Elevação"
                className="rounded-xl border border-slate-700"
              />
            ) : (
              <p className="text-slate-500">
                Não enviado
              </p>
            )}
          </div>

        </div>

      </div>

      <div className="flex gap-4 flex-wrap">

        <AnalisarImagensButton
  projetoId={projeto.id}
/>

<GerarRelatorioButton
  projeto={projeto}
/>

      </div>

    </main>
  );
}