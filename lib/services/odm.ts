/**
 * Serviço de Integração OpenDroneMap (NodeODM)
 * 
 * Este serviço orquestra a comunicação entre a Praxis Drone e instâncias NodeODM.
 * O NodeODM recebe um conjunto de imagens capturadas por drones, realiza o processamento fotogramétrico 
 * e devolve ativos como Ortomosaico, Modelos Digitais de Superfície (DSM/DTM) e Nuvens de Pontos.
 */

// A URL da API do NodeODM será preferencialmente injetada via variável de ambiente.
const ODM_API_URL = process.env.NEXT_PUBLIC_ODM_API_URL || "http://localhost:3000";

export interface ODMTaskOptions {
  name?: string;
  // Para geração de NDVI usando o motor nativo (se a câmera for suportada)
  radiometricCalibration?: "none" | "camera" | "camera+sun";
  // Flags avançadas do ODM (ex: --dsm --orthophoto-resolution 2.0)
  options?: string; 
  webhook?: string;
}

export interface ODMTaskInfo {
  uuid: string;
  name: string;
  status: {
    code: number; // 10 = Queued, 20 = Running, 30 = Failed, 40 = Completed, 50 = Canceled
    error?: string;
  };
  processingTime?: number;
}

/**
 * Inicia um novo processamento no ODM enviando um array de arquivos (Imagens)
 */
export async function iniciarProcessamentoODM(imagens: File[], config?: ODMTaskOptions): Promise<string> {
  const formData = new FormData();
  
  if (config?.options) formData.append("options", JSON.stringify([config.options]));
  if (config?.name) formData.append("name", config.name);
  if (config?.webhook) formData.append("webhook", config.webhook);

  // Anexar todas as imagens ao FormData (o NodeODM espera o campo "images")
  imagens.forEach((file) => {
    formData.append("images", file);
  });

  try {
    const response = await fetch(`${ODM_API_URL}/task/new`, {
      method: "POST",
      body: formData,
      // Nota: Não definimos 'Content-Type' manualmente, o fetch cuida dos boundaries do multipart/form-data
    });

    if (!response.ok) {
      throw new Error(`Erro na API do ODM: ${response.statusText}`);
    }

    const data = await response.json();
    return data.uuid; // Retorna o ID da tarefa para acompanhamento
  } catch (error) {
    console.error("Falha ao iniciar processamento fotogramétrico:", error);
    throw error;
  }
}

/**
 * Consulta o status atual de uma tarefa de processamento no ODM
 */
export async function verificarStatusODM(taskId: string): Promise<ODMTaskInfo> {
  try {
    const response = await fetch(`${ODM_API_URL}/task/${taskId}/info`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Erro ao verificar status do ODM: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      uuid: data.uuid,
      name: data.name,
      status: {
        code: data.status.code,
        error: data.status.error,
      },
      processingTime: data.processingTime,
    };
  } catch (error) {
    console.error("Falha ao verificar status fotogramétrico:", error);
    throw error;
  }
}

/**
 * Baixa um ativo específico do processamento (ex: orthophoto.tif, dsm.tif)
 */
export async function baixarAtivoODM(taskId: string, asset: "orthophoto.tif" | "dsm.tif" | "all.zip"): Promise<Blob> {
  try {
    const response = await fetch(`${ODM_API_URL}/task/${taskId}/download/${asset}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Erro ao baixar arquivo ${asset} do ODM: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error(`Falha ao baixar ${asset}:`, error);
    throw error;
  }
}

/**
 * Cancela um processamento em andamento
 */
export async function cancelarTarefaODM(taskId: string): Promise<boolean> {
  try {
    const response = await fetch(`${ODM_API_URL}/task/${taskId}/cancel`, {
      method: "POST",
    });
    
    return response.ok;
  } catch (error) {
    console.error("Falha ao cancelar tarefa fotogramétrica:", error);
    return false;
  }
}
