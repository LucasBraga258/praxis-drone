import { supabaseAdmin as supabase } from "../supabase/admin";
/**
 * Process Manager (A Máquina de Estados)
 * 
 * É o responsável direto pela tabela `mission_jobs`.
 * Toda vez que uma Missão é enfileirada, ele gerencia as transições
 * de "QUEUED" para "RUNNING" até "COMPLETED" ou "FAILED".
 */

type JobStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "RETRYING";

export async function logProcess(jobId: string, projetoId: string, acao: string, status: "INFO" | "WARN" | "ERROR" | "SUCCESS" = "INFO", mensagem: string = "", duracaoMs: number = 0) {
  try {
    await supabase.from("process_logs").insert({
      job_id: jobId,
      projeto_id: projetoId,
      acao,
      status,
      mensagem,
      duracao_ms: duracaoMs
    });
    console.log(`[PROCESS LOG] ${acao} - ${status}: ${mensagem}`);
  } catch (err) {
    console.error("Falha gravíssima ao escrever log de processo", err);
  }
}

export async function gerarNotificacao(projetoId: string, tipo: "SUCESSO" | "ERRO" | "ALERTA" | "INFO", titulo: string, mensagem: string) {
  try {
    await supabase.from("notificacoes").insert({
      projeto_id: projetoId,
      tipo,
      titulo,
      mensagem
    });
  } catch (err) {
    console.error("Falha ao gerar notificação:", err);
  }
}

export async function iniciarJob(projetoId: string): Promise<string | null> {
  try {
    // 1. Cria a fila inicial do projeto
    const { data: job, error } = await supabase
      .from("mission_jobs")
      .insert({
        projeto_id: projetoId,
        status: "QUEUED",
        etapa_atual: "UPLOAD_CONCLUIDO",
        started_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (error) throw error;
    
    await logProcess(job.id, projetoId, "Job Criado", "INFO", "Missão enfileirada para orquestração automática.");
    return job.id;
  } catch (err: any) {
    console.error("Erro ao iniciar Job:", err);
    return null;
  }
}

export async function atualizarStatusJob(jobId: string, status: JobStatus, etapaAtual: string, errorLog: string | null = null) {
  try {
    await supabase
      .from("mission_jobs")
      .update({
        status,
        etapa_atual: etapaAtual,
        error_log: errorLog,
        updated_at: new Date().toISOString()
      })
      .eq("id", jobId);
  } catch (err) {
    console.error("Erro ao atualizar Job:", err);
  }
}

export async function registrarTentativa(jobId: string): Promise<boolean> {
  // Retorna true se ainda há tentativas sobrando
  try {
    const { data: job, error } = await supabase
      .from("mission_jobs")
      .select("tentativas, max_tentativas")
      .eq("id", jobId)
      .single();
    
    if (error) throw error;

    const novasTentativas = (job.tentativas || 0) + 1;
    
    await supabase.from("mission_jobs").update({ tentativas: novasTentativas }).eq("id", jobId);

    if (novasTentativas > job.max_tentativas) {
      return false; // Estourou o limite (Abort)
    }
    return true;
  } catch (err) {
    return false;
  }
}

export async function isAlguemProcessando(): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("mission_jobs")
      .select("id")
      .in("status", ["RUNNING", "RETRYING"])
      .limit(1);
    
    return !!(data && data.length > 0);
  } catch (err) {
    return false;
  }
}

export async function buscarProximoDaFila(): Promise<{ id: string, projeto_id: number } | null> {
  try {
    const { data } = await supabase
      .from("mission_jobs")
      .select("id, projeto_id")
      .eq("status", "QUEUED")
      .order("started_at", { ascending: true })
      .limit(1)
      .single();
    
    return data || null;
  } catch (err) {
    return null;
  }
}
