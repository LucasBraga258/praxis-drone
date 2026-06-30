import { NextResponse } from "next/server";
import { executarPipelineAssincrono } from "@/lib/services/pipeline";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projetoId } = body;

    if (!projetoId) {
      return NextResponse.json({ error: "projetoId é obrigatório" }, { status: 400 });
    }

    // 1. O pulo do gato: Chamamos a função sem "await" para que ela rode em background.
    // Isso libera o cliente (navegador) imediatamente.
    // Nota: Em ambientes Serverless restritos (Vercel free), processos em background
    // podem ser mortos. Mas como os processamentos serão em servidor próprio/local, 
    // o processo Node.js manterá a promise viva.
    executarPipelineAssincrono(projetoId).catch(err => {
      console.error("Falha silenciosa no Pipeline em Background:", err);
    });

    // 2. Respondemos OK imediatamente
    return NextResponse.json({ 
      success: true, 
      message: "Pipeline de processamento iniciado em background." 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
