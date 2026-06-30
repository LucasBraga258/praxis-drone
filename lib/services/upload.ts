import { uploadArquivo } from "./storage";
import { registrarArquivos } from "./arquivos";
import { atualizarStatusProjeto } from "./projetos";
import { executarPipelineAssincrono } from "./pipeline";

export interface UploadProgress {
  percentual: number;
  enviados: number;
  total: number;
  arquivoAtual: string;
}

export async function uploadFotosProjeto(
  projetoId: number,
  arquivos: File[],
  onProgress?: (
    progress: UploadProgress
  ) => void
) {
  const registros = [];
  const TAMANHO_LOTE = 10; // Envia de 10 em 10 simultaneamente
  let enviadosTotais = 0;

  for (let i = 0; i < arquivos.length; i += TAMANHO_LOTE) {
    const lote = arquivos.slice(i, i + TAMANHO_LOTE);
    
    // Processa o lote atual concorrentemente
    const resultadosLote = await Promise.all(
      lote.map(async (arquivo) => {
        const nomeArquivo = `${Date.now()}-${arquivo.name}`;
        const caminho = `${projetoId}/fotos/${nomeArquivo}`;
        
        try {
          await uploadArquivo("projetos", caminho, arquivo);
          
          return {
            projeto_id: projetoId,
            nome: arquivo.name,
            caminho,
            tipo: "foto",
            tamanho: arquivo.size,
            origem: "Upload",
            status: "Disponível",
            processado: false,
          };
        } catch (err) {
          console.error(`Falha no upload do arquivo ${arquivo.name}:`, err);
          return null; // Falhou, ignoramos no registro do BD pra tentar depois
        }
      })
    );

    // Registra apenas os que deram sucesso neste lote
    const sucessos = resultadosLote.filter((res) => res !== null);
    registros.push(...sucessos);
    
    enviadosTotais += lote.length;

    const percentual = Math.round((enviadosTotais / arquivos.length) * 100);
    onProgress?.({
      percentual,
      enviados: enviadosTotais,
      total: arquivos.length,
      arquivoAtual: `Lote de ${lote.length} fotos (${enviadosTotais}/${arquivos.length})`,
    });
  }

  await registrarArquivos(registros);

  await atualizarStatusProjeto(
    projetoId,
    "Fotos recebidas"
  );

  // Inicia o orquestrador real da Sprint 6 (Em background)
  // O executador assíncrono criará os logs de início e prosseguirá para a fila do ODM
  executarPipelineAssincrono(projetoId.toString()).catch(e => {
    console.error("Erro catastrófico ao despachar a missão para a esteira:", e);
  });
}