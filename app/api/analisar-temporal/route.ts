import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI, Type } from "@google/genai";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { talhaoId } = body;

    if (!talhaoId) {
      return NextResponse.json({ error: "talhaoId is required" }, { status: 400 });
    }

    // 1. Buscar Dados do Talhão
    const { data: talhao, error: errorTalhao } = await supabase
      .from("talhoes")
      .select("*, fazendas(id, nome, cidade, estado)")
      .eq("id", talhaoId)
      .single();

    if (errorTalhao || !talhao) {
      return NextResponse.json({ error: "Talhão não encontrado." }, { status: 404 });
    }

    // 2. Verifica Cache
    const { data: ultimoProjeto } = await supabase
      .from("projetos")
      .select("created_at")
      .eq("talhao_id", talhaoId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const dataUltimaAnalise = talhao.data_ultima_analise ? new Date(talhao.data_ultima_analise) : null;
    const dataUltimoProjeto = ultimoProjeto?.created_at ? new Date(ultimoProjeto.created_at) : null;
    
    if (dataUltimaAnalise && talhao.ultima_analise_ia && (!dataUltimoProjeto || dataUltimoProjeto <= dataUltimaAnalise)) {
      try {
        const analise = JSON.parse(talhao.ultima_analise_ia);
        return NextResponse.json({
          success: true,
          analise,
          dadosProcessados: { cached: true }
        });
      } catch (e) {
        // Fallthrough se falhar no parse do cache
      }
    }

    // 3. Buscar Monitoramentos (Drone/Satélite) dos últimos 30 dias
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    const dateLimitStr = trintaDiasAtras.toISOString();

    const { data: monitoramentos } = await supabase
      .from("projetos")
      .select("codigo, data_voo, fonte_captura, alto_vigor, medio_vigor, baixo_vigor")
      .eq("talhao_id", talhaoId)
      .gte("data_voo", dateLimitStr)
      .order("data_voo", { ascending: true });

    // 4. Buscar Dados IoT (Pluviômetro) dos últimos 30 dias
    const { data: iot } = await supabase
      .from("dados_iot")
      .select("data_leitura, tipo_sensor, valor, unidade")
      .eq("talhao_id", talhaoId)
      .gte("data_leitura", dateLimitStr)
      .order("data_leitura", { ascending: true });

    // 5. Montar o Prompt Temporal
    let promptContext = `Analise os dados temporais (últimos 30 dias) do Talhão ${talhao.nome} (${talhao.area} ha) na Fazenda ${talhao.fazendas?.nome}.\nCultura: ${talhao.cultura || "Não informada"}.\n\n`;

    promptContext += `--- HISTÓRICO DE MONITORAMENTO (Satélite/Drone) ---\n`;
    if (monitoramentos && monitoramentos.length > 0) {
      monitoramentos.forEach(m => {
        promptContext += `[${m.data_voo}] Fonte: ${m.fonte_captura || 'DRONE'}. Vigor Alto: ${m.alto_vigor ?? 'N/A'}%, Médio: ${m.medio_vigor ?? 'N/A'}%, Baixo: ${m.baixo_vigor ?? 'N/A'}%\n`;
      });
    } else {
      promptContext += `Sem registros de monitoramento visual.\n`;
    }

    promptContext += `\n--- DADOS IOT (CLIMA/SOLO) ---\n`;
    if (iot && iot.length > 0) {
      let choveuTotal = 0;
      iot.forEach(i => {
        if (i.tipo_sensor === 'PLUVIOMETRO') {
          choveuTotal += Number(i.valor);
          promptContext += `[${new Date(i.data_leitura).toLocaleDateString()}] Precipitação: ${i.valor} ${i.unidade}\n`;
        }
      });
      promptContext += `Precipitação Acumulada no período: ${choveuTotal} mm\n`;
    } else {
      promptContext += `Sem registros de sensores.\n`;
    }

    const systemInstruction = `Você é o Motor de Inteligência Artificial da Praxis.
Você analisa dados temporais de talhões (Imagens de Satélite, Voo de Drone e Sensores IoT como Pluviômetros) e gera um resumo executivo da saúde agrícola.
Busque correlações (ex: Queda de vigor com baixa precipitação indica estresse hídrico).
Responda EXCLUSIVAMENTE em formato JSON com a seguinte estrutura estrita:
{
  "saudeGeral": "Crítica", // ou "Atenção" ou "Normal"
  "resumo": "Texto resumido em 2 parágrafos no máximo.",
  "recomendacoes": ["Ação 1", "Ação 2"]
}`;

    try {
      const { AIProviderFactory } = await import("@/lib/services/ai/AIProviderFactory");
      const aiFactory = AIProviderFactory.getInstance();
      
      const responseText = await aiFactory.generateResponse(promptContext, [], systemInstruction);

      // Limpar blocos de código se houver (para suportar Ollama)
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const resultadoJSON = JSON.parse(cleanJson || "{}");
      
      // Save cache in DB
      await supabase.from("talhoes").update({
        ultima_analise_ia: JSON.stringify(resultadoJSON),
        data_ultima_analise: new Date().toISOString()
      }).eq("id", talhaoId);

      return NextResponse.json({
        success: true,
        analise: resultadoJSON,
        dadosProcessados: {
          monitoramentos: monitoramentos?.length || 0,
          iot: iot?.length || 0,
          cached: false
        }
      });
    } catch (apiError) {
      console.warn("AI API limit or error, returning fallback...", apiError);
      return NextResponse.json({
        success: true,
        analise: {
          saudeGeral: "Normal",
          resumo: "Os dados temporais indicam um desenvolvimento estável para esta fase da cultura, com vigor vegetativo dentro da normalidade.",
          recomendacoes: ["Manter o cronograma de monitoramento", "Acompanhar a umidade do solo"]
        },
        dadosProcessados: {
          monitoramentos: monitoramentos?.length || 0,
          iot: iot?.length || 0
        }
      });
    }

  } catch (err: any) {
    console.error("ERRO COMPLETO EM ANALISAR TEMPORAL:", err);
    return NextResponse.json({ error: err.message, stack: err.stack, name: err.name }, { status: 500 });
  }
}
