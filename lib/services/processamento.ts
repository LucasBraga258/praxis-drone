import { supabase } from "../supabase";

export async function buscarPipelineProjeto(
  projetoId: number
) {
  const { data, error } = await supabase
    .from("jobs_processamento")
    .select("*")
    .eq("projeto_id", projetoId)
    .order("ordem");

  if (error) throw error;

  return data;
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