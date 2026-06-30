import { buscarProjeto } from "@/lib/services/projetos";
import MissionHeader from "./MissionHeader";
import MissionIndicators from "./MissionIndicators";
import PipelineProjeto from "@/app/components/PipelineProjeto";
import MissionUpload from "./MissionUpload";
import MissionProducts from "./MissionProducts";
import MissionInterventions from "./MissionInterventions";
import MissionTechnicalData from "./MissionTechnicalData";
import MissionFiles from "./MissionFiles";
import MissionActions from "./MissionActions";

export default async function MissaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projetoResult = await buscarProjeto(Number(id));

  if (!projetoResult) {
    return (
      <main className="min-h-screen bg-[#07111F] text-white p-10">
        <h1 className="text-3xl font-bold">Missão não encontrada</h1>
        <p className="text-slate-400 mt-2">
          A missão solicitada não existe ou foi removida.
        </p>
      </main>
    );
  }

  const fazenda = Array.isArray(projetoResult.fazendas)
    ? projetoResult.fazendas[0]
    : projetoResult.fazendas ?? null;

  const projeto = {
    ...projetoResult,
    fazendas: fazenda,
    arquivos_projeto: Array.isArray(projetoResult.arquivos_projeto)
      ? projetoResult.arquivos_projeto
      : [],
    jobs_processamento: Array.isArray(projetoResult.jobs_processamento)
      ? projetoResult.jobs_processamento
      : [],
    intervencoes: Array.isArray(projetoResult.intervencoes)
      ? projetoResult.intervencoes
      : [],
  };

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. Header — identidade da missão */}
        <MissionHeader projeto={projeto} />

        {/* 2. Indicadores Agronômicos */}
        <MissionIndicators
          altoVigor={projeto.alto_vigor || 0}
          medioVigor={projeto.medio_vigor || 0}
          baixoVigor={projeto.baixo_vigor || 0}
        />

        {/* 3. Pipeline de Processamento */}
        <PipelineProjeto projetoId={Number(id)} />

        {/* 4. Upload */}
        <MissionUpload projetoId={Number(id)} />

        {/* 5. Produtos Gerados */}
        <MissionProducts
          projetoId={Number(id)}
          camera={projeto.camera}
          ortomosaicoUrl={projeto.ortomosaico_url}
          ndviUrl={projeto.ndvi_url}
          webgisUrl={projeto.webgis_url}
          pdfUrl={projeto.pdf_url}
          ortomosaicoImgUrl={projeto.ortomosaico_img_url}
          ndviImgUrl={projeto.ndvi_img_url}
          elevacaoImgUrl={projeto.elevacao_img_url}
        />

        {/* 6. Arquivos + Ações */}
        <div className="grid lg:grid-cols-2 gap-6">
          <MissionFiles arquivos={projeto.arquivos_projeto} />
          <MissionActions projetoId={projeto.id} />
        </div>

        {/* 7. Intervenções */}
        <MissionInterventions intervencoes={projeto.intervencoes} />

        {/* 8. Dados Técnicos */}
        <MissionTechnicalData
          cultura={projeto.cultura}
          municipio={projeto.municipio}
          uf={projeto.uf}
          gsd={projeto.gsd}
          latitude={projeto.latitude}
          longitude={projeto.longitude}
          elevacaoMin={projeto.elevacao_min}
          elevacaoMax={projeto.elevacao_max}
          piloto={projeto.piloto}
          drone={projeto.drone}
          camera={projeto.camera}
          alturaVoo={projeto.altura_voo}
          sobreposicaoFrontal={projeto.sobreposicao_frontal}
          sobreposicaoLateral={projeto.sobreposicao_lateral}
        />

      </div>
    </main>
  );
}
