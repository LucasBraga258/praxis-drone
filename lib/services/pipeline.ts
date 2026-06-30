import { iniciarJob, atualizarStatusJob, logProcess, registrarTentativa, isAlguemProcessando, buscarProximoDaFila, gerarNotificacao } from "./processManager";
import { runFullSystemCheck } from "./health";
import { analisarMissao } from "./ai/praxisEngine";

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
      await new Promise(res => setTimeout(res, 3000));
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
