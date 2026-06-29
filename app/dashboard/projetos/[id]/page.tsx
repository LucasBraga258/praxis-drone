import PipelineProjeto from "../../../components/PipelineProjeto";
import { buscarProjeto } from "../../../../lib/services/projetos";
import MissionHeader from "./MissionHeader";
import MissionFiles from "./MissionFiles";
import MissionActions from "./MissionActions";

type IntervencaoProjeto = {
  id: number | string;
  data_intervencao?: string | null;
  praga?: string | null;
  produto?: string | null;
  dose?: string | null;
  responsavel?: string | null;
};

export default async function ProjetoAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const projetoResult = await buscarProjeto(Number(id));

  const fazendaResult = projetoResult
    ? Array.isArray(projetoResult.fazendas)
      ? projetoResult.fazendas[0]
      : projetoResult.fazendas ??
        (Array.isArray(projetoResult.fazenda)
          ? projetoResult.fazenda[0]
          : projetoResult.fazenda) ??
        null
    : null;

  const projeto = projetoResult
    ? {
        ...projetoResult,
        fazendas: fazendaResult,
        arquivos_projeto:
          Array.isArray(projetoResult.arquivos_projeto)
            ? projetoResult.arquivos_projeto
            : [],
        jobs_processamento:
          Array.isArray(projetoResult.jobs_processamento)
            ? projetoResult.jobs_processamento
            : [],
        intervencoes:
          Array.isArray(projetoResult.intervencoes)
            ? projetoResult.intervencoes
            : [],
      }
    : null;

console.log("PROJETO:", JSON.stringify(projeto, null, 2));

  const arquivos = projeto?.arquivos_projeto ?? [];

  const quantidadeFotos =
    arquivos.filter((a: any) => a?.tipo === "foto").length || 0;

  const tamanhoTotal =
    (arquivos
      .filter((a: any) => a?.tipo === "foto")
      .reduce(
        (acc: number, a: any) => acc + Number(a?.tamanho || 0),
        0
      ) || 0);

  const ultimoUpload = arquivos.length
    ? arquivos.sort(
        (a: any, b: any) =>
          new Date(b?.created_at).getTime() -
          new Date(a?.created_at).getTime()
      )[0]
    : null;

  const intervencoes: IntervencaoProjeto[] = Array.isArray(
    projeto?.intervencoes
  )
    ? projeto.intervencoes
    : [];

  if (!projeto) {
    return (
      <main className="min-h-screen bg-[#07111F] text-white p-10">
        <h1 className="text-3xl font-bold">
          Projeto não encontrado
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <MissionHeader projeto={projeto} />

      <div className="grid md:grid-cols-2 gap-4 mb-4">

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">Data do voo</p>

          <h2 className="text-2xl font-bold">{projeto.data_voo}</h2>
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">Área Mapeada</p>

          <h2 className="text-2xl font-bold">{projeto.area_mapeada} ha</h2>
        </div>

      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">

        <div className="bg-[#16253D] p-6 rounded-xl">Produtos (Em desenvolvimento)</div>

        <div className="bg-[#16253D] p-6 rounded-xl">Timeline (Em desenvolvimento)</div>

        <div className="bg-[#16253D] p-6 rounded-xl">IA (Em desenvolvimento)</div>

      </div>

      <div className="bg-[#16253D] p-6 rounded-xl mb-8">

        <h2 className="text-2xl font-bold mb-4">Indicadores Agronômicos</h2>

        <div className="grid md:grid-cols-3 gap-4">

          <div>
            <p className="text-slate-400">Alto Vigor</p>

            <h3 className="text-3xl font-bold text-green-400">{projeto.alto_vigor || 0}%</h3>
          </div>

          <div>
            <p className="text-slate-400">Médio Vigor</p>

            <h3 className="text-3xl font-bold text-yellow-400">{projeto.medio_vigor || 0}%</h3>
          </div>

          <div>
            <p className="text-slate-400">Baixo Vigor</p>

            <h3 className="text-3xl font-bold text-red-400">{projeto.baixo_vigor || 0}%</h3>
          </div>

        </div>

      </div>

      <div className="bg-[#16253D] p-6 rounded-xl mb-8">

        <PipelineProjeto projetoId={Number(id)} />

      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">

        <MissionFiles arquivos={arquivos} />

        <div className="p-4 bg-white rounded-xl shadow-sm">
          <h3 className="font-semibold mb-2">Validation</h3>
          <p className="text-sm text-slate-500">Em desenvolvimento</p>
        </div>

        <MissionActions projetoId={projeto.id} />

      </div>

      <div className="bg-[#16253D] p-6 rounded-xl mb-8">

        <h2 className="text-2xl font-bold mb-4">Dados Técnicos</h2>

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <p className="text-slate-400">Cultura</p>

            <p>{projeto.cultura || "-"}</p>
          </div>

          <div>
            <p className="text-slate-400">Município / UF</p>

            <p>{projeto.municipio || "-"} / {projeto.uf || "-"}</p>
          </div>

          <div>
            <p className="text-slate-400">GSD</p>

            <p>{projeto.gsd || "-"}</p>
          </div>

          <div>
            <p className="text-slate-400">Coordenadas</p>

            <p>{projeto.latitude || "-"}, {projeto.longitude || "-"}</p>
          </div>

          <div>
            <p className="text-slate-400">Elevação Mínima</p>

            <p>{projeto.elevacao_min || "-"}</p>
          </div>

          <div>
            <p className="text-slate-400">Elevação Máxima</p>

            <p>{projeto.elevacao_max || "-"}</p>
          </div>

        </div>

      </div>
      <div className="bg-[#16253D] p-6 rounded-xl mb-8">

  <h2 className="text-2xl font-bold mb-6">
    ✈️ Missão de Voo
  </h2>

  <div className="grid md:grid-cols-2 gap-4">

    <div>
      <p className="text-slate-400">
        Piloto
      </p>

      <p>
        {projeto.piloto || "-"}
      </p>
    </div>

    <div>
      <p className="text-slate-400">
        Drone
      </p>

      <p>
        {projeto.drone || "-"}
      </p>
    </div>

    <div>
      <p className="text-slate-400">
        Câmera
      </p>

      <p>
        {projeto.camera || "-"}
      </p>
    </div>

    <div>
      <p className="text-slate-400">
        Altitude
      </p>

      <p>
        {projeto.altura_voo
          ? `${projeto.altura_voo} m`
          : "-"}
      </p>
    </div>

    <div>
      <p className="text-slate-400">
        Sobreposição Frontal
      </p>

      <p>
        {projeto.sobreposicao_frontal
          ? `${projeto.sobreposicao_frontal}%`
          : "-"}
      </p>
    </div>

    <div>
      <p className="text-slate-400">
        Sobreposição Lateral
      </p>

      <p>
        {projeto.sobreposicao_lateral
          ? `${projeto.sobreposicao_lateral}%`
          : "-"}
      </p>
    </div>

  </div>

</div>

<div className="bg-[#16253D] p-6 rounded-xl mb-8">

  <div className="flex justify-between items-center mb-6">

    <h2 className="text-2xl font-bold">
      📂 Arquivos do Projeto
    </h2>

    <button
      className="bg-green-700 px-4 py-2 rounded-lg font-semibold"
    >
      📤 Enviar Fotos
    </button>

  </div>

  <div className="space-y-4">

    <div className="flex justify-between bg-[#0F1C30] p-4 rounded-xl">

  <div>

    <p className="font-semibold">
      📷 Fotos Originais
    </p>

    {quantidadeFotos > 0 ? (

      <>

        <p className="text-slate-400 text-sm">
          {quantidadeFotos} imagens
        </p>

        <p className="text-slate-400 text-sm">
          {(tamanhoTotal / 1024 / 1024).toFixed(2)} MB
        </p>

        <p className="text-slate-500 text-xs mt-1">
          Último envio:
          {" "}
          {ultimoUpload?.created_at
            ? new Date(
                ultimoUpload.created_at
              ).toLocaleString("pt-BR")
            : "-"}
        </p>

      </>

    ) : (

      <p className="text-slate-400 text-sm">
        Ainda não enviadas
      </p>

    )}

  </div>

  <span
    className={
      quantidadeFotos
        ? "text-green-400"
        : "text-yellow-400"
    }
  >
    {quantidadeFotos
      ? "Recebidas"
      : "Aguardando"}
  </span>

</div>
    <div className="flex justify-between bg-[#0F1C30] p-4 rounded-xl">
      <div>
        <p className="font-semibold">
          🗺 Ortomosaico
        </p>

        <p className="text-slate-400 text-sm">
          Ainda não processado
        </p>
      </div>

      <span className="text-slate-400">
        —
      </span>
    </div>

    <div className="flex justify-between bg-[#0F1C30] p-4 rounded-xl">
      <div>
        <p className="font-semibold">
          🌿 NDVI
        </p>

        <p className="text-slate-400 text-sm">
          Ainda não gerado
        </p>
      </div>

      <span className="text-slate-400">
        —
      </span>
    </div>

    <div className="flex justify-between bg-[#0F1C30] p-4 rounded-xl">
      <div>
        <p className="font-semibold">
          🏔 Modelo de Elevação
        </p>

        <p className="text-slate-400 text-sm">
          Ainda não gerado
        </p>
      </div>

      <span className="text-slate-400">
        —
      </span>
    </div>

    <div className="flex justify-between bg-[#0F1C30] p-4 rounded-xl">
      <div>
        <p className="font-semibold">
          📄 Relatório
        </p>

        <p className="text-slate-400 text-sm">
          Ainda não disponível
        </p>
      </div>

      <span className="text-slate-400">
        —
      </span>
    </div>

  </div>

</div>

      <div className="bg-[#16253D] p-6 rounded-xl mb-8">

        <h2 className="text-2xl font-bold mb-4">
          Links do Projeto
        </h2>

        <div className="space-y-4">

          <div>
            <p className="text-slate-400 mb-1">
              NDVI
            </p>

            {projeto.ndvi_url ? (
              <a
                href={projeto.ndvi_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 underline"
              >
                Abrir NDVI
              </a>
            ) : (
              <p className="text-slate-500">
                Não informado
              </p>
            )}
          </div>

          <div>
            <p className="text-slate-400 mb-1">
              Ortomosaico
            </p>

            {projeto.ortomosaico_url ? (
              <a
                href={projeto.ortomosaico_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 underline"
              >
                Abrir Ortomosaico
              </a>
            ) : (
              <p className="text-slate-500">
                Não informado
              </p>
            )}
          </div>

          <div>
            <p className="text-slate-400 mb-1">
              WebGIS
            </p>

            {projeto.webgis_url ? (
              <a
                href={projeto.webgis_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 underline"
              >
                Abrir WebGIS
              </a>
            ) : (
              <p className="text-slate-500">
                Não informado
              </p>
            )}
          </div>

        </div>

      </div>

      <div className="bg-[#16253D] p-6 rounded-xl mb-8">

  <h2 className="text-2xl font-bold mb-4">
    🧪 Intervenções Relacionadas
  </h2>

  {intervencoes?.length ? (

    <div className="space-y-4">

      {intervencoes?.map((item) => (

        <div
          key={item.id}
          className="bg-[#0F1C30] p-4 rounded-xl"
        >

          <p>
            📅 {item.data_intervencao}
          </p>

          <p>
            🐛 {item.praga || "-"}
          </p>

          <p>
            🧪 {item.produto || "-"}
          </p>

          <p>
            💉 {item.dose || "-"}
          </p>

          <p>
            👨‍🌾 {item.responsavel || "-"}
          </p>

        </div>

      ))}

    </div>

  ) : (

    <p className="text-slate-400">
      Nenhuma intervenção registrada.
    </p>

  )}

</div>

     
    

  

      <div className="flex flex-wrap gap-4">

        <a
          href={`/projetos/${projeto.id}`}
          target="_blank"
          className="bg-green-700 px-6 py-3 rounded-xl font-bold"
        >
          Visualizar Projeto Público
        </a>

        <a
          href={`/dashboard/projetos/${projeto.id}/editar`}
          className="bg-blue-700 px-6 py-3 rounded-xl font-bold"
        >
          Editar Projeto
        </a>

        <a
          href={`/dashboard/projetos/${projeto.id}/diagnostico`}
          className="bg-purple-700 px-6 py-3 rounded-xl font-bold"
        >
          Diagnóstico
        </a>
         <a
         href={`/dashboard/projetos/${projeto.id}/upload`}
         className="bg-green-700 px-6 py-3 rounded-xl font-bold"
         >
          📤 Enviar Fotos
        </a>

      </div>

    </main>
  );
}
