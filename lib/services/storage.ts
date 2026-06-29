import { supabase } from "../supabase";

export async function uploadArquivo(
  bucket: string,
  caminho: string,
  arquivo: File
) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(caminho, arquivo);

  if (error) throw error;

  return caminho;
}