import { supabase } from "../supabase";
import { criarPipelineProjeto } from "./processamento";

export interface Missao {
  id: number;
  codigo: string;
  status: string;
  data_voo: string;
  area_mapeada: number;
  piloto: string;
  drone: string;
  camera: string;

  fazendas: {
    id: number;
    nome: string;
  } | null;

  jobs_processamento?: {
    etapa: string;
    status: string;
    progresso: number;
    ordem: number;
  }[];
}

export interface CriarProjetoDTO {
  fazendaId: number;
  talhaoId: number;
  dataVoo: string;
  areaMapeada: number;
  piloto: string;
  drone: string;
  camera: string;
  alturaVoo?: number | null;
  sobreposicaoFrontal?: number | null;
  sobreposicaoLateral?: number | null;
}

/* ===========================================================
   LISTAGEM
=========================================================== */

export async function listarMissoes(): Promise<Missao[]> {
  const { data, error } = await supabase
    .from("projetos")
    .select(`
  *,
  fazendas (
    id,
    nome
  ),
  jobs_processamento (
    etapa,
    status,
    progresso,
    ordem
  )
`)
    .order("id", {
      ascending: false,
    });

  if (error) throw error;

  return (data ?? []) as Missao[];
}

export async function buscarMissoes(
  busca?: string,
  status?: string
): Promise<Missao[]> {
  let query = supabase
    .from("projetos")
    .select(`
      *,
      fazendas (
        id,
        nome
      )
    `);

  if (status && status !== "Todos") {
    query = query.eq("status", status);
  }

  if (busca && busca.trim() !== "") {
    query = query.ilike("codigo", `%${busca}%`);
  }

  const { data, error } = await query.order("id", {
    ascending: false,
  });

  if (error) throw error;

  return (data ?? []) as Missao[];
}

export async function buscarProjeto(projetoId: number) {
  const { data: projeto, error } = await supabase
    .from("projetos")
    .select(`
      *,
      fazendas (*),
      arquivos_projeto (*),
      jobs_processamento (*)
    `)
    .eq("id", projetoId)
    .single();

  if (error) throw error;

  const {
    data: intervencoes,
    error: intervencoesError,
  } = await supabase
    .from("intervencoes")
    .select("*")
    .eq("fazenda_id", projeto.fazenda_id);

  if (intervencoesError) throw intervencoesError;

  return {
    ...projeto,
    intervencoes: intervencoes || [],
  };
}

/* ===========================================================
   CRIAÇÃO
=========================================================== */

export async function criarProjeto(
  dados: CriarProjetoDTO
) {
  const ano = new Date().getFullYear();

  const { count } = await supabase
    .from("projetos")
    .select("*", {
      count: "exact",
      head: true,
    });

  const sequencia = String((count || 0) + 1).padStart(
    3,
    "0"
  );

  const codigo = `${ano}-${sequencia}`;

  const { data: projeto, error } = await supabase
    .from("projetos")
    .insert([
      {
        fazenda_id: dados.fazendaId,
        talhao_id: dados.talhaoId,
        codigo,
        data_voo: dados.dataVoo,
        area_mapeada: dados.areaMapeada,
        status: "Processando",
        piloto: dados.piloto,
        drone: dados.drone,
        camera: dados.camera,
        altura_voo: dados.alturaVoo,
        sobreposicao_frontal:
          dados.sobreposicaoFrontal,
        sobreposicao_lateral:
          dados.sobreposicaoLateral,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  await criarPipelineProjeto(projeto.id);

  await atualizarProximoVoo(
    dados.fazendaId,
    dados.dataVoo
  );

  return projeto;
}

/* ===========================================================
   ATUALIZAÇÃO
=========================================================== */

export async function atualizarStatusProjeto(
  projetoId: number,
  status: string
) {
  const { error } = await supabase
    .from("projetos")
    .update({
      status,
    })
    .eq("id", projetoId);

  if (error) throw error;
}

/* ===========================================================
   PRIVADAS
=========================================================== */

async function atualizarProximoVoo(
  fazendaId: number,
  dataVoo: string
) {
  const { data: fazenda } = await supabase
    .from("fazendas")
    .select("frequencia_monitoramento")
    .eq("id", fazendaId)
    .single();

  if (!fazenda?.frequencia_monitoramento) return;

  const proximoVoo = new Date(dataVoo);

  proximoVoo.setDate(
    proximoVoo.getDate() +
      fazenda.frequencia_monitoramento
  );

  await supabase
    .from("fazendas")
    .update({
      proximo_voo: proximoVoo
        .toISOString()
        .split("T")[0],
    })
    .eq("id", fazendaId);
}