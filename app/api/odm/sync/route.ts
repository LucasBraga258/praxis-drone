import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verificarStatusODM } from "@/lib/services/odm";
import { atualizarStatusJob, logProcess } from "@/lib/services/processManager";
import { AIProviderFactory } from "@/lib/services/ai/AIProviderFactory";

// Simula a injeção cognitiva (A Mágica da IA) após o processamento ODM
async function gerarRelatorioIA(projetoId: string, odmTaskId: string) {
  try {
    const supabase = await createClient();
    // Obter dados do projeto
    const { data: projeto } = await supabase
      .from("projetos")
      .select("*, fazendas(nome)")
      .eq("id", projetoId)
      .single();

    if (!projeto) return;

    const promptOculto = `
      Você é um Engenheiro Agrônomo consultor especialista em Agricultura de Precisão.
      O processamento fotogramétrico de uma missão de drone acaba de ser concluído.
      
      Detalhes da Missão:
      - Fazenda: ${projeto.fazendas?.nome || "Não identificada"}
      - Nome do Projeto: ${projeto.nome}
      - ID da Tarefa ODM: ${odmTaskId}
      - Data do Processamento: ${new Date().toLocaleDateString("pt-BR")}

      Considere cenários genéricos de índice de vigor (NDVI) com falhas médias de plantio em cerca de 5% da área e provável estresse hídrico leve em áreas periféricas.
      Gere um Relatório Agronômico técnico, objetivo e estruturado em Markdown contendo:
      1. Análise Geral do Vigor da Biomassa.
      2. Pontos de Atenção (Problemas Encontrados).
      3. Recomendações Técnicas de Manejo.
      
      Não inclua saudações, vá direto ao relatório.
    `;

    // Dispara a requisição via Factory Orquestradora
    const respostaIA = await AIProviderFactory.getInstance().generateResponse(
      promptOculto,
      [],
      "Relatório Agronômico Automático"
    );

    // Salvar o relatório no banco
    if (respostaIA) {
      await supabase
        .from("projetos")
        .update({ relatorio_ia: respostaIA })
        .eq("id", projetoId);
        
      await logProcess(odmTaskId, projetoId, "IA Analisou", "SUCCESS", "Relatório agronômico gerado automaticamente via Factory IA.");
    }
  } catch (error) {
    console.error("Erro na injeção cognitiva da IA:", error);
    await logProcess(odmTaskId, projetoId, "Erro na IA", "ERROR", "Falha ao gerar relatório automático.");
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const rawBody = await req.text();
    if (!rawBody) {
      return NextResponse.json({ error: "Body vazio" }, { status: 400 });
    }
    const body = JSON.parse(rawBody);
    const { projetoId } = body;

    if (!projetoId) {
      return NextResponse.json({ error: "Faltando projetoId" }, { status: 400 });
    }

    // Pega o Job Ativo do Projeto
    const { data } = await supabase
      .from("mission_jobs")
      .select("*")
      .eq("projeto_id", projetoId)
      .order("created_at", { ascending: false })
      .limit(1);

    const job = data?.[0];

    if (!job) {
      return NextResponse.json({ status: "NO_JOB" });
    }

    const odmTaskId = job.id;

    if (job.status === "COMPLETED") {
      return NextResponse.json({ status: "ALREADY_COMPLETED", progress: "Missão 100% concluída." });
    }
    
    if (job.status === "FAILED") {
      return NextResponse.json({ status: "FAILED", error: "O processamento falhou." });
    }

    if (job.etapa_atual === "NODEODM" && job.odm_uuid) {
      try {
        const statusInfo = await verificarStatusODM(job.odm_uuid);
        if (statusInfo.status.code === 40) {
          // Concluiu! Atualiza URLs e avança pra IA
          const baseODM = process.env.NEXT_PUBLIC_ODM_API_URL || "http://127.0.0.1:3001";
          await supabase.from("projetos").update({
            ortomosaico_url: `${baseODM}/task/${job.odm_uuid}/download/orthophoto.tif`,
            dsm_url: `${baseODM}/task/${job.odm_uuid}/download/dsm.tif`
          }).eq("id", projetoId);
          
          await atualizarStatusJob(job.id, "RUNNING", "INTELIGENCIA_ARTIFICIAL");
          
          // Roda IA em background sem travar a resposta
          gerarRelatorioIA(projetoId.toString(), job.id).then(async () => {
             await atualizarStatusJob(job.id, "COMPLETED", "FINALIZADO");
          }).catch(console.error);
          
          return NextResponse.json({ status: "RUNNING", progress: "Fotogrametria concluída. Iniciando IA..." });
        } else if (statusInfo.status.code === 30 || statusInfo.status.code === 50) {
          await atualizarStatusJob(job.id, "FAILED", "NODEODM", "Erro no NodeODM");
          return NextResponse.json({ status: "FAILED", error: "NodeODM falhou." });
        }
      } catch (err) {
        console.error("Erro ao verificar ODM no sync:", err);
      }
    }

    return NextResponse.json({ status: "RUNNING", progress: "Processando na Nuvem..." });

  } catch (error: any) {
    console.error("Erro no Sync API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
