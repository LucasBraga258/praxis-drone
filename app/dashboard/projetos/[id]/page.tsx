import MissionHeader from "./MissionHeader";
import MissionIndicators from "./MissionIndicators";
import PipelineProjeto from "@/app/components/PipelineProjeto";
import MissionUpload from "./MissionUpload";
import MissionProducts from "./MissionProducts";
import MissionInterventions from "./MissionInterventions";
import MissionTechnicalData from "./MissionTechnicalData";
import MissionFiles from "./MissionFiles";
import MissionActions from "./MissionActions";
import MissionGallery from "./MissionGallery";
import MissionFlightMapClient from "./MissionFlightMapClient";
import MissionAIReport from "./MissionAIReport";
import { createClient } from "@/lib/supabase/server";

export default async function MissaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const supabase = await createClient();
  const { data: projetoResult } = await supabase
    .from("projetos")
    .select(`
      *,
      fazendas (id, nome, cidade, estado),
      talhoes (id, nome, cultura, area_hectares),
      arquivos_projeto (*),
      jobs_processamento (*)
    `)
    .eq("id", Number(id))
    .single();

  if (projetoResult) {
    const { data: intervencoes } = await supabase
      .from("intervencoes")
      .select("*")
      .eq("talhao_id", projetoResult.talhao_id);
    
    projetoResult.intervencoes = intervencoes || [];
  }

  if (!projetoResult) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", padding: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Monitoramento não encontrado</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 8 }}>
          O monitoramento solicitado não existe ou foi removido.
        </p>
      </main>
    );
  }

  const fazenda = Array.isArray(projetoResult.fazendas)
    ? projetoResult.fazendas[0]
    : projetoResult.fazendas ?? null;

  const talhao = Array.isArray(projetoResult.talhoes)
    ? projetoResult.talhoes[0]
    : projetoResult.talhoes ?? null;

  const projeto = {
    ...projetoResult,
    fazendas: fazenda,
    talhoes: talhao,
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
    <main className="praxis-content" style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* 1. Header — identidade humanizada do monitoramento */}
        <MissionHeader projeto={projeto} />

        {/* 2. Mapa de Voo Imediato — aparece com ou sem ortomosaico */}
        <div style={{ marginBottom: 24 }}>
          <MissionFlightMapClient
            projetoId={Number(id)}
            ortomosaicoUrl={projeto.ortomosaico_img_url ?? null}
            ndviUrl={projeto.ndvi_img_url ?? null}
            variUrl={projeto.vari_img_url ?? null}
            falsaCorUrl={projeto.falsa_cor_img_url ?? null}
          />
        </div>

        {projeto.fonte_captura !== 'Satelite' && (
          <>
            {/* 3. Pipeline de Processamento */}
            <div style={{ marginBottom: 24 }}>
              <PipelineProjeto projetoId={Number(id)} />
            </div>
          </>
        )}

        {/* 3.5 Relatório Mágico da IA (Se existir) */}
        <MissionAIReport markdown={projeto.relatorio_ia} />

        {projeto.fonte_captura !== 'Satelite' && (
          <>
            {/* 4. Upload de Imagens (só se ainda não tiver fotos OU se o user quiser mais) */}
            <div style={{ marginBottom: 24 }}>
              <MissionUpload projetoId={Number(id)} />
            </div>
          </>
        )}

        {/* 5. Indicadores Agronômicos */}
        <MissionIndicators
          altoVigor={projeto.alto_vigor || 0}
          medioVigor={projeto.medio_vigor || 0}
          baixoVigor={projeto.baixo_vigor || 0}
        />

        {projeto.fonte_captura !== 'Satelite' && (
          <>
            {/* 6. Galeria de Imagens com EXIF */}
            <div style={{ marginBottom: 24 }}>
              <MissionGallery projetoId={Number(id)} />
            </div>
          </>
        )}

        {/* 7. Produtos Gerados */}
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
          dsmImgUrl={projeto.dsm_img_url}
          dtmImgUrl={projeto.dtm_img_url}
          fonte_captura={projeto.fonte_captura}
          relatorioIa={projeto.relatorio_ia}
        />

        {projeto.fonte_captura !== 'Satelite' && (
          <>
            {/* 8. Arquivos + Ações */}
            <div className="grid lg:grid-cols-2 gap-6" style={{ marginBottom: 24 }}>
              <MissionFiles arquivos={projeto.arquivos_projeto} />
              <MissionActions projetoId={projeto.id} />
            </div>
          </>
        )}

        {/* 9. Intervenções */}
        <MissionInterventions intervencoes={projeto.intervencoes} />

        {/* 10. Dados Técnicos */}
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
          fonteCaptura={projeto.fonte_captura}
        />

      </div>
    </main>
  );
}
