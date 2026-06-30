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
  } catch (error) {
    console.error("[ia-chat] Erro:", error);
    return NextResponse.json(
      { erro: "Erro ao processar a resposta da IA." },
      { status: 500 }
    );
  }
}
