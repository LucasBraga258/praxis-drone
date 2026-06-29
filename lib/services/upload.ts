import { uploadArquivo } from "./storage";
import { registrarArquivos } from "./arquivos";
import { atualizarStatusProjeto } from "./projetos";
import {
  atualizarEtapaPipeline,
} from "./processamento";
import { simularPipeline } from "./simulador";

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

  for (let i = 0; i < arquivos.length; i++) {

    const arquivo = arquivos[i];

    const nomeArquivo =
      `${Date.now()}-${arquivo.name}`;

    const caminho =
      `${projetoId}/fotos/${nomeArquivo}`;

    await uploadArquivo(
      "projetos",
      caminho,
      arquivo
    );

    const percentual = Math.round(
      ((i + 1) / arquivos.length) * 100
    );

    onProgress?.({
      percentual,
      enviados: i + 1,
      total: arquivos.length,
      arquivoAtual: arquivo.name,
    });

    registros.push({
      projeto_id: projetoId,
      nome: arquivo.name,
      caminho,
      tipo: "foto",
      tamanho: arquivo.size,
      origem: "Upload",
      status: "Disponível",
      processado: false,
    });

  }

  await registrarArquivos(registros);

  await atualizarStatusProjeto(
    projetoId,
    "Fotos recebidas"
  );

  // Finaliza a etapa de Upload
  await atualizarEtapaPipeline(
    projetoId,
    "Upload",
    "Concluído",
    100
  );

  // Inicia o processamento
  await atualizarEtapaPipeline(
    projetoId,
    "OpenDroneMap",
    "Processando",
    0
  );

  // Inicia a simulação do pipeline
  simularPipeline(projetoId);
}