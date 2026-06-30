import { supabase } from "../supabase";

export async function buscarPipelineProjeto(projetoId: number) {
  // Busca a situação atual da Máquina de Estados (Sprint 6)
  const { data: job, error } = await supabase
    .from("mission_jobs")
    .select("*")
    .eq("projeto_id", projetoId)
    .single();

  // Mapeamento visual das etapas
  const etapasDefinidas = [
    { key: "UPLOAD_CONCLUIDO", label: "Upload & Verificação", ordem: 1 },
    { key: "HEALTH_CHECK", label: "Diagnóstico de Nuvem", ordem: 2 },
    { key: "NODEODM", label: "OpenDroneMap (Fotogrametria)", ordem: 3 },
    { key: "INTELIGENCIA_ARTIFICIAL", label: "IA Praxis (Anomalias)", ordem: 4 },
    { key: "RELATORIO_PDF", label: "Relatório & Entrega", ordem: 5 },
  ];

  if (error || !job) {
    // Se o job não existe, todas pendentes
    return etapasDefinidas.map(e => ({ id: e.key, etapa: e.label, status: "Aguardando", progresso: 0 }));
  }

  // Determina o index da etapa atual baseada na chave salva no motor
  const etapaAtualIndex = etapasDefinidas.findIndex(e => e.key === job.etapa_atual);

  return etapasDefinidas.map((e, index) => {
    let status = "Aguardando";
    let progresso = 0;

    if (job.status === "COMPLETED") {
      status = "Concluído";
      progresso = 100;
    } else if (job.status === "FAILED") {
      if (index === etapaAtualIndex) {
        status = "Erro";
        progresso = 0;
      } else if (index < etapaAtualIndex) {
        status = "Concluído";
        progresso = 100;
      }
    } else {
      // RUNNING, QUEUED ou RETRYING
      if (index < etapaAtualIndex) {
        status = "Concluído";
        progresso = 100;
      } else if (index === etapaAtualIndex) {
        status = job.status === "RETRYING" ? "Retentando..." : "Processando";
        progresso = 50; // Visual de metade para indicar andamento
      }
    }

    return { id: e.key, etapa: e.label, status, progresso };
  });
}

const ETAPAS = [
  { etapa: "Upload", ordem: 1 },
  { etapa: "OpenDroneMap", ordem: 2 },
  { etapa: "Ortomosaico", ordem: 3 },
  { etapa: "NDVI", ordem: 4 },
  { etapa: "Modelo de Elevação", ordem: 5 },
  { etapa: "IA Praxis", ordem: 6 },
  { etapa: "Relatório", ordem: 7 },
  { etapa: "Entrega", ordem: 8 },
];

export async function criarPipelineProjeto(
  projetoId: number
) {
  const registros = ETAPAS.map((item) => ({
    projeto_id: projetoId,
    etapa: item.etapa,
    ordem: item.ordem,
  }));

  const { error } = await supabase
    .from("jobs_processamento")
    .insert(registros);

  if (error) throw error;
}
export async function atualizarEtapaPipeline(
  projetoId: number,
  etapa: string,
  status: string,
  progresso: number,
  mensagem?: string
) {
  const { error } = await supabase
    .from("jobs_processamento")
    .update({
      status,
      progresso,
      mensagem,
      updated_at: new Date().toISOString(),
    })
    .eq("projeto_id", projetoId)
    .eq("etapa", etapa);

  if (error) throw error;
}
export async function buscarEtapaPipeline(
  projetoId: number,
  etapa: string
) {
  const { data, error } = await supabase
    .from("jobs_processamento")
    .select("*")
    .eq("projeto_id", projetoId)
    .eq("etapa", etapa)
    .single();

  if (error) throw error;

  return data;
}
export async function concluirEtapaPipeline(
  projetoId: number,
  etapa: string
) {
  return atualizarEtapaPipeline(
    projetoId,
    etapa,
    "Concluído",
    100
  );
}
export async function iniciarEtapaPipeline(
  projetoId: number,
  etapa: string
) {
  return atualizarEtapaPipeline(
    projetoId,
    etapa,
    "Processando",
    0
  );
}