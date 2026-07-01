import { createClient } from "../supabase/client";

const supabase = createClient();
export async function uploadArquivo(
  bucket: string,
  caminho: string,
  file: File
) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(caminho, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(caminho);

  return data.publicUrl;
}

export async function uploadArquivoProjeto(
  projetoId: number,
  file: File
) {
  const caminho = `projeto-${projetoId}/rgb/${file.name}`;

  const { error: uploadError } =
    await supabase.storage
      .from("missoes")
      .upload(caminho, file, {
        upsert: true,
      });

  if (uploadError)
    throw uploadError;

  const {
    data: publicUrlData,
  } = supabase.storage
    .from("missoes")
    .getPublicUrl(caminho);

  const { error: bancoError } =
    await supabase
      .from("arquivos_projeto")
      .insert({
        projeto_id: projetoId,

        nome: file.name,

        tipo: file.type,

        tamanho: file.size,

        bucket: "missoes",

        caminho,

        url: publicUrlData.publicUrl,

        status: "Upload",
      });

  if (bancoError)
    throw bancoError;

  return publicUrlData.publicUrl;
}