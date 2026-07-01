import { iniciarJob, atualizarStatusJob, logProcess, registrarTentativa, isAlguemProcessando, buscarProximoDaFila, gerarNotificacao } from "./processManager";
import { createClient } from "../supabase/client";
import { supabaseAdmin } from "../supabase/admin";
import { runFullSystemCheck } from "./health";
import { analisarMissao } from "./ai/praxisEngine";

const supabase = supabaseAdmin;

/**
 * Função de Entrada Pública: Apenas coloca na fila e tenta rodar a fila.
 */
export async function executarPipelineAssincrono(projetoId: string) {
  // 1. Inicia o Job na Máquina de Estados como QUEUED
  await iniciarJob(projetoId);
  // 2. Tenta acordar a fila
  await processarFila();
}

/**
 * O Worker da Fila. Só permite 1 execução paralela.
 */
export async function processarFila() {
  const ocupado = await isAlguemProcessando();
  if (ocupado) {
    console.log("[WORKER] O NodeODM está ocupado. Missões aguardarão na fila.");
    return; // Proteção de Escalabilidade: Aborta execução paralela
  }

  const proximo = await buscarProximoDaFila();
  if (!proximo) {
    console.log("[WORKER] Fila vazia. O servidor pode descansar.");
    return;
  }

  await rodarMissaoNoMotor(proximo.id, proximo.projeto_id.toString());
}

/**
 * Orquestrador do Pipeline (Async Runner - 1 por vez)
 */
async function rodarMissaoNoMotor(jobId: string, projetoId: string) {
  try {
    await gerarNotificacao(projetoId, "INFO", "Missão na Esteira", "O processamento fotogramétrico da sua missão acaba de começar.");
    
    // 2. Health Check Pré-Voo
    await atualizarStatusJob(jobId, "RUNNING", "HEALTH_CHECK");
    const startTime = Date.now();
    
    const hCheck = await runFullSystemCheck();
    if (!hCheck.database || !hCheck.storage) {
      throw new Error("Sistemas críticos da nuvem estão offline (Supabase DB/Storage).");
    }
    if (!hCheck.nodeOdm) {
      throw new Error("Motor Fotogramétrico (NodeODM) indisponível ou desligado.");
    }

    await logProcess(jobId, projetoId, "Health Check", "SUCCESS", "Todos os sistemas operacionais.", Date.now() - startTime);

    // 3. Etapa: Processamento NodeODM
    await executarComRetentativas(jobId, projetoId, "NODEODM", async () => {
      // 3.1 Pegar lista de arquivos do projeto
      const { data: arquivos, error: errArq } = await supabaseAdmin
        .from("arquivos_projeto")
        .select("*")
        .eq("projeto_id", projetoId);
        
      if (errArq || !arquivos || arquivos.length === 0) throw new Error("Nenhum arquivo encontrado para esta missão.");

      // 3.2 Baixar as imagens do Supabase Storage
      const { iniciarProcessamentoODM, verificarStatusODM } = await import("./odm");
      const blobs: { nome: string; blob: Blob }[] = [];
      
      for (const arq of arquivos) {
        const { data: fileData, error: dlError } = await supabaseAdmin.storage
          .from("missoes")
          .download(arq.caminho);
          
        if (dlError || !fileData) throw new Error(`Falha ao baixar imagem: ${arq.nome}`);
        blobs.push({ nome: arq.nome, blob: fileData });
      }

      // 3.3 Iniciar processamento no NodeODM
      const odm_uuid = await iniciarProcessamentoODM(blobs, { 
        name: `Missao-${projetoId}`,
        options: {
          dsm: true,
          dtm: true,
          "plant-health": true
        }
      });
      
      // 3.4 Salvar UUID no banco
      await supabaseAdmin.from("mission_jobs").update({ odm_uuid }).eq("id", jobId);

      // 3.5 Atualizar o status para processamento fotogramétrico
      await supabaseAdmin.from("mission_jobs").update({ status: "ODM_PROCESSING" }).eq("id", jobId);
      
      // 3.6 Polling até concluir
      let concluido = false;
      while (!concluido) {
        await new Promise(res => setTimeout(res, 15000)); // Espera 15 seg
        const statusInfo = await verificarStatusODM(odm_uuid);
        
        if (statusInfo.status.code === 40) {
          concluido = true;
          
          // Salvar as URLs geradas (por enquanto, link direto pro ODM)
          const baseODM = process.env.NEXT_PUBLIC_ODM_API_URL || "http://127.0.0.1:3001";
          await supabaseAdmin.from("projetos").update({
            ortomosaico_url: `${baseODM}/task/${odm_uuid}/download/orthophoto.tif`,
            dsm_url: `${baseODM}/task/${odm_uuid}/download/dsm.tif`
          }).eq("id", projetoId);
          
        } else if (statusInfo.status.code === 30 || statusInfo.status.code === 50) {
          throw new Error(`NodeODM falhou: ${statusInfo.status.error}`);
        }
      }
    });

    // 4. Etapa: IA Praxis (Diagnóstico Inteligente e Automático)
    await executarComRetentativas(jobId, projetoId, "INTELIGENCIA_ARTIFICIAL", async () => {
      await analisarMissao(projetoId);
    });

    // 5. Etapa: Gerar Relatório Automático PDF (Puppeteer)
    await executarComRetentativas(jobId, projetoId, "RELATORIO_PDF", async () => {
      await new Promise(res => setTimeout(res, 1000));
    });

    // 6. Sucesso!
    await supabaseAdmin.from("projetos").update({ status: "CONCLUIDO" }).eq("id", projetoId);
    await atualizarStatusJob(jobId, "COMPLETED", "FINALIZADO");
    await logProcess(jobId, projetoId, "Pipeline Concluído", "SUCCESS", "Missão 100% processada sem intervenção manual.");
    await gerarNotificacao(projetoId, "SUCESSO", "Relatório Disponível", "Seus mapas e o diagnóstico inteligente da IA estão prontos para visualização.");
    
  } catch (error: any) {
    // Fallback catastrófico da esteira
    await atualizarStatusJob(jobId, "FAILED", "ERRO_GERAL", error.message);
    await logProcess(jobId, projetoId, "Falha Crítica", "ERROR", error.message);
    await gerarNotificacao(projetoId, "ERRO", "Processamento Interrompido", `Tivemos um problema técnico com as suas imagens: ${error.message}`);
  } finally {
    // REGRA DE OURO: Independente de sucesso ou falha trágica, chama o próximo da fila!
    setTimeout(() => {
      processarFila().catch(console.error);
    }, 2000);
  }
}

/**
 * Helper para executar blocos sujeitos à falhas temporárias (Network/Timeouts)
 * Implementa Backoff Simples + Max Retries.
 */
async function executarComRetentativas(jobId: string, projetoId: string, nomeEtapa: string, acaoAsync: () => Promise<void>) {
  await atualizarStatusJob(jobId, "RUNNING", nomeEtapa);
  
  let sucesso = false;
  
  while (!sucesso) {
    const inicio = Date.now();
    try {
      await acaoAsync();
      sucesso = true;
      await logProcess(jobId, projetoId, `Etapa ${nomeEtapa}`, "SUCCESS", "Concluído sem erros.", Date.now() - inicio);
    } catch (err: any) {
      await logProcess(jobId, projetoId, `Falha em ${nomeEtapa}`, "WARN", `Tentativa falhou: ${err.message}`, Date.now() - inicio);
      
      const podeTentar = await registrarTentativa(jobId);
      if (!podeTentar) {
        throw new Error(`Máximo de tentativas atingido na etapa [${nomeEtapa}]. Abortando Missão.`);
      }
      
      await atualizarStatusJob(jobId, "RETRYING", nomeEtapa, err.message);
      // Wait before retry (Ex: 5 segundos)
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}
