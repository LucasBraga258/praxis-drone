import { createClient } from "../supabase/client";

const supabase = createClient();
export interface Talhao {

  id: number;

  fazenda_id: number;

  nome: string;

  cultura: string | null;

  variedade: string | null;

  safra: string | null;

  area: number | null;

  observacoes: string | null;

  created_at: string;

}

export async function listarTalhoes(
  fazendaId: number
): Promise<Talhao[]> {

  const { data, error } =
    await supabase

      .from("talhoes")

      .select("*")

      .eq("fazenda_id", fazendaId)

      .order("nome");

  if (error)
    throw error;

  return data ?? [];

}

export async function buscarTalhao(
  talhaoId: number
): Promise<Talhao> {

  const { data, error } =
    await supabase

      .from("talhoes")

      .select("*")

      .eq("id", talhaoId)

      .single();

  if (error)
    throw error;

  return data;

}

export async function criarTalhao(
  dados: {

    fazenda_id: number;

    nome: string;

    cultura?: string;

    variedade?: string;

    safra?: string;

    area?: number;

    observacoes?: string;

  }

) {

  const { data, error } =
    await supabase

      .from("talhoes")

      .insert(dados)

      .select()

      .single();

  if (error)
    throw error;

  return data;

}

export async function editarTalhao(

  talhaoId: number,

  dados: Partial<Talhao>

) {

  const { data, error } =
    await supabase

      .from("talhoes")

      .update(dados)

      .eq("id", talhaoId)

      .select()

      .single();

  if (error)
    throw error;

  return data;

}

export async function excluirTalhao(
  talhaoId: number
) {

  const { error } =
    await supabase

      .from("talhoes")

      .delete()

      .eq("id", talhaoId);

  if (error)
    throw error;

}

export async function listarMissoesTalhao(
  talhaoId: number
) {

  const { data, error } =
    await supabase

      .from("projetos")

      .select("*")

      .eq("talhao_id", talhaoId)

      .order("data_voo", {
        ascending: false,
      });

  if (error)
    throw error;

  return data ?? [];

}

export async function contarMissoesTalhao(
  talhaoId: number
): Promise<number> {

  const { count, error } =
    await supabase

      .from("projetos")

      .select("*", {

        count: "exact",

        head: true,

      })

      .eq("talhao_id", talhaoId);

  if (error)
    throw error;

  return count ?? 0;

}