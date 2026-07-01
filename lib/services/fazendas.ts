import { createClient } from "../supabase/client";

const supabase = createClient();
export interface Fazenda {
  id: number;
  nome: string;
  cidade?: string | null;
  estado?: string | null;
  area_ha?: number | null;
  frequencia_monitoramento?: number | null;
}

export async function listarFazendas(): Promise<Fazenda[]> {
  const { data, error } = await supabase
    .from("fazendas")
    .select("*")
    .order("nome");

  if (error) throw error;

  return data ?? [];
}
