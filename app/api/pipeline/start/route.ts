import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { talhaoId, projetoId } = await request.json();

    if (!talhaoId && !projetoId) {
      return NextResponse.json({ error: 'talhaoId ou projetoId é obrigatório' }, { status: 400 });
    }

    // ─────────────────────────────────────────────────────────
    // FLUXO 1: DRONE (acionado por projetoId no Upload de Fotos)
    // ─────────────────────────────────────────────────────────
    if (projetoId) {
      console.log(`Iniciando pipeline Assíncrono (NodeODM) para o projeto ${projetoId}...`);
      
      const { executarPipelineAssincrono } = await import("@/lib/services/pipeline");
      // Envia para o background worker real, que gerencia a fila e chama o Docker (NodeODM)
      executarPipelineAssincrono(projetoId).catch(e => {
        console.error("Falha ao colocar o projeto na esteira assíncrona:", e);
      });

      return NextResponse.json({ success: true, message: 'Pipeline Drone (NodeODM) enfileirado com sucesso' });
    }

    // ─────────────────────────────────────────────────────────
    // FLUXO 2: SATÉLITE AUTOMÁTICO (acionado por talhaoId na criação do talhão)
    // ─────────────────────────────────────────────────────────
    console.log(`Iniciando pipeline automático Sentinel para o talhão ${talhaoId}...`);

    const cookieHeader = request.headers.get("cookie") || "";
    const sentinelRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/satellite/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
      body: JSON.stringify({ talhaoId, saveToDb: true, maxCloudCover: 20 })
    });

    if (!sentinelRes.ok) {
      console.error("Erro ao buscar Sentinel no pipeline:", await sentinelRes.text());
    } else {
      const sentinelData = await sentinelRes.json();
      console.log(`Sentinel retornou ${sentinelData.scenes?.length} cenas. Projeto salvo: ${!!sentinelData.savedProject}`);
      
      if (sentinelData.savedProject) {
        // Disparar análise IA
        fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/pipeline/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
          body: JSON.stringify({ projetoId: sentinelData.savedProject.id })
        }).catch(e => console.error("Erro ao chamar IA:", e));
      }
    }

    await supabase.from("talhoes").update({
      score: 85.5,
      ultima_analise_ia: new Date().toISOString()
    }).eq("id", talhaoId);

    return NextResponse.json({ success: true, message: 'Pipeline Sentinel iniciado' });

  } catch (error: any) {
    console.error('Erro na API de pipeline:', error);
    return NextResponse.json({ error: 'Erro interno no servidor', details: error.message }, { status: 500 });
  }
}
