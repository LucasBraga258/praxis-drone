import { NextRequest, NextResponse } from "next/server";
import { buscarContextoPropriedade, enviarMensagemIA } from "@/lib/services/ai/chat";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      pergunta,
      historico = [],
      fazendaId,
      talhaoId,
      projetoId,
    } = body;

    if (!pergunta || typeof pergunta !== "string") {
      return NextResponse.json({ erro: "Pergunta inválida." }, { status: 400 });
    }

    // Busca contexto da propriedade
    const contexto = await buscarContextoPropriedade({ fazendaId, talhaoId, projetoId });

    // Envia para a IA
    const resposta = await enviarMensagemIA(pergunta, historico, contexto);

    return NextResponse.json({ resposta });
  } catch (error: any) {
    console.error("[ia-chat] Erro:", error.message || error);
    let msgErro = "Erro técnico na IA: " + (error.message || "Desconhecido");
    
    // Tratamento mais amigável para estouro de limite (Google API 429)
    if (msgErro.includes("429") || msgErro.includes("quota") || msgErro.includes("RESOURCE_EXHAUSTED")) {
      msgErro = "⚠️ O limite de uso gratuito da Inteligência Artificial (Google Gemini) foi excedido. Para continuar utilizando a IA Praxis, adicione informações de faturamento no seu projeto do Google Cloud / AI Studio.";
    }

    return NextResponse.json(
      { resposta: msgErro },
      { status: 500 }
    );
  }
}
