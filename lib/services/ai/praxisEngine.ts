import { supabase } from "../../supabase";

export interface Anomalia {
  tipo: string;
  severidade: "Baixa" | "Média" | "Alta" | "Crítica";
  area_afetada_ha: number;
  coordenadas?: number[];
}

export interface IntervencaoSugerida {
  produto: string;
  dose: string;
  urgencia: "Imediata" | "Planejada";
}

export interface LaudoIA {
  saude_geral: string;
  alto_vigor_pct: number;
  medio_vigor_pct: number;
  baixo_vigor_pct: number;
  nivel_confianca: number;
  anomalias_detectadas: Anomalia[];
  recomendacoes_tecnicas: string;
  prioridade_geral: "Normal" | "Media" | "Critica";
  intervencoes_sugeridas: IntervencaoSugerida[];
}

/**
 * Praxis AI Engine 1.0
 * Módulo agnóstico preparado para conectar à APIs LLM (OpenAI/Anthropic) no futuro.
 */
export async function analisarMissao(projetoId: string | number): Promise<void> {
  console.log(`[Praxis AI] Iniciando análise profunda para Missão ${projetoId}...`);
  
  // 1. Extração de Contexto (Busca dados da fazenda, histórico, cultura e área)
  const { data: projeto, error } = await supabase
    .from("projetos")
    .select("*, fazendas(nome)")
    .eq("id", projetoId)
    .single();

  if (error || !projeto) throw new Error("Projeto não encontrado para análise IA");

  // 2. Inferência (Aqui no futuro injetaremos a chamada via API para GPT-4 Vision)
  // Por ora, rodamos um Algoritmo Heurístico Dinâmico simulando a inteligência:
  const laudo = simularInferenciaInteligente(projeto.area_mapeada || 100);

  // 3. Salvar o Cérebro no Banco de Dados
  const { error: dbError } = await supabase
    .from("diagnosticos_ia")
    .upsert({
      projeto_id: projetoId,
      saude_geral: laudo.saude_geral,
      alto_vigor_pct: laudo.alto_vigor_pct,
      medio_vigor_pct: laudo.medio_vigor_pct,
      baixo_vigor_pct: laudo.baixo_vigor_pct,
      nivel_confianca: laudo.nivel_confianca,
      anomalias_detectadas: laudo.anomalias_detectadas,
      recomendacoes_tecnicas: laudo.recomendacoes_tecnicas,
      prioridade_geral: laudo.prioridade_geral,
      intervencoes_sugeridas: laudo.intervencoes_sugeridas
    }, { onConflict: 'projeto_id' });

  if (dbError) {
    console.error("[Praxis AI] Falha ao persistir Laudo:", dbError);
    throw new Error("Falha ao salvar o diagnóstico gerado pela IA.");
  }

  // 4. Criação Autônoma de Intervenções (A verdadeira Automação do SaaS)
  await transformarRecomendacoesEmIntervencoes(projetoId, laudo.intervencoes_sugeridas);
}

/**
 * Função Auxiliar: Converte texto da IA em Prescrições reais no Banco
 */
async function transformarRecomendacoesEmIntervencoes(projetoId: string | number, sugestoes: IntervencaoSugerida[]) {
  if (sugestoes.length === 0) return;

  const payloads = sugestoes.map(sug => ({
    projeto_id: projetoId,
    tipo: "Pulverizacao", // Default inferido
    data_planejada: new Date().toISOString(), // Hoje
    status: "Pendente",
    produto: sug.produto,
    dose_por_ha: sug.dose,
    observacoes: `[IA AUTOMAÇÃO] Nível de Urgência: ${sug.urgencia}`
  }));

  const { error } = await supabase.from("intervencoes").insert(payloads);
  if (error) console.error("[Praxis AI] Falha ao injetar Intervenções automáticas:", error);
}

/**
 * Função Auxiliar: Motor Heurístico Mock (Até a conexão LLM Real)
 */
function simularInferenciaInteligente(areaTotalHa: number): LaudoIA {
  const isProblemaGrave = Math.random() > 0.5; // Randomiza um cenário

  if (isProblemaGrave) {
    return {
      saude_geral: "Alerta Crítico: Detecção de anomalia severa padrão espiral no quadrante Noroeste. Assinatura espectral condizente com estresse hídrico extremo ou infestação severa de nematóides.",
      alto_vigor_pct: 35,
      medio_vigor_pct: 20,
      baixo_vigor_pct: 45,
      nivel_confianca: 92.5,
      prioridade_geral: "Critica",
      anomalias_detectadas: [
        { tipo: "Reboleira / Nematoide", severidade: "Alta", area_afetada_ha: areaTotalHa * 0.2 },
        { tipo: "Falha de Plantio", severidade: "Média", area_afetada_ha: areaTotalHa * 0.1 }
      ],
      recomendacoes_tecnicas: "Isolar área afetada imediatamente e realizar amostragem de solo direcionada. Necessário aplicação de nematicida no alvo. Agendar voo de monitoramento multiespectral em 15 dias.",
      intervencoes_sugeridas: [
        { produto: "Nematicida Biológico Genérico", dose: "5L / ha", urgencia: "Imediata" }
      ]
    };
  }

  return {
    saude_geral: "Talhão estabilizado e saudável. Excelente desenvolvimento de dossel foliar e distribuição homogênea do índice clorofiliano.",
    alto_vigor_pct: 78,
    medio_vigor_pct: 18,
    baixo_vigor_pct: 4,
    nivel_confianca: 96.8,
    prioridade_geral: "Normal",
    anomalias_detectadas: [
      { tipo: "Mato Competição Leve", severidade: "Baixa", area_afetada_ha: areaTotalHa * 0.02 }
    ],
    recomendacoes_tecnicas: "Manter o manejo padrão nutricional. Não há necessidade de intervenção curativa imediata.",
    intervencoes_sugeridas: []
  };
}
