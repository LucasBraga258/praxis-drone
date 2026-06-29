import { supabase } from "../supabase";

export async function registrarArquivos(
  registros: any[]
) {
  const { error } = await supabase
    .from("arquivos_projeto")
    .insert(registros);

  if (error) throw error;
}

export async function listarArquivosProjeto(
  projetoId: number
) {
  const { data, error } = await supabase
    .from("arquivos_projeto")
    .select("*")
    .eq("projeto_id", projetoId);

  if (error) throw error;

  return data;
}
export async function listarArquivosPorTipo(
  projetoId: number,
  tipo: string
) {
  const { data, error } = await supabase
    .from("arquivos_projeto")
    .select("*")
    .eq("projeto_id", projetoId)
    .eq("tipo", tipo);

  if (error) throw error;

  return data;
}
export async function contarArquivosProjeto(
  projetoId: number
) {
  const { count, error } = await supabase
    .from("arquivos_projeto")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("projeto_id", projetoId);

  if (error) throw error;

  return count || 0;
}
export async function calcularEspacoProjeto(
  projetoId: number
) {
  const arquivos =
    await listarArquivosProjeto(projetoId);

  const total = arquivos.reduce(
    (acc, arquivo) =>
      acc + (arquivo.tamanho || 0),
    0
  );

  return total;
}