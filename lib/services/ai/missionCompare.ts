import { supabase } from "../../supabase";

/**
 * Motor de IA Heurístico: Comparação Temporal (Sprint 8)
 * 
 * Este algoritmo simula o cruzamento de pixels de dois ortomosaicos/NDVIs 
 * para entender se a intervenção agronômica surtiu efeito, quantificando 
 * a melhora ou a piora da saúde vegetal (Deltas).
 */
export async function analisarEvolucaoTemporal(
  talhaoId: number,
  missaoAntigaId: number,
  missaoNovaId: number
) {
  try {
    // 1. Coleta os metadados brutos das missões passadas
    const { data: missaoAntiga, error: err1 } = await supabase
      .from("projetos")
      .select("alto_vigor, medio_vigor, baixo_vigor, area_ha, fazenda_id")
      .eq("id", missaoAntigaId)
      .single();

    const { data: missaoNova, error: err2 } = await supabase
      .from("projetos")
      .select("alto_vigor, medio_vigor, baixo_vigor, area_ha, data_voo")
      .eq("id", missaoNovaId)
      .single();

    if (err1 || err2 || !missaoAntiga || !missaoNova) {
      throw new Error("Missões inválidas para comparação espacial.");
    }

    // 2. Extrai a Área em Hectares do Talhão (Assume a área da missão se nula)
    const areaTotalHa = missaoNova.area_ha || 100;

    // 3. Calcula o Delta (Antes e Depois) de saúde
    // Ex: Antes tinha 20% de alto vigor. Agora tem 50%. Houve ganho de 30% em alto vigor.
    const deltaAltoVigor = (missaoNova.alto_vigor || 0) - (missaoAntiga.alto_vigor || 0);
    const deltaBaixoVigor = (missaoNova.baixo_vigor || 0) - (missaoAntiga.baixo_vigor || 0);

    // 4. Converte Percentual para Hectares Absolutos (Área Recuperada vs Degradada)
    const areaRecuperadaHa = deltaAltoVigor > 0 ? (deltaAltoVigor / 100) * areaTotalHa : 0;
    const areaDegradadaHa = deltaBaixoVigor > 0 ? (deltaBaixoVigor / 100) * areaTotalHa : 0;

    // 5. Motor de Natural Language Generation (NLG) para respostas executivas
    let statusEvolucao = "ESTAVEL";
    let laudo = "A área encontra-se estável, sem oscilações drásticas no vigor foliar em relação ao monitoramento anterior.";

    if (deltaAltoVigor >= 5) {
      statusEvolucao = "MELHORA";
      laudo = `Houve uma franca recuperação do dossel vegetativo! Identificamos um ganho de +${deltaAltoVigor.toFixed(1)}% no vigor foliar. As intervenções realizadas (ou condições climáticas) surtiram efeito positivo, convertendo aproximadamente ${areaRecuperadaHa.toFixed(1)} hectares em áreas de alta produtividade.`;
    } else if (deltaBaixoVigor >= 5) {
      statusEvolucao = "PIORA";
      laudo = `Atenção: A saúde vegetativa caiu. Houve um aumento de +${deltaBaixoVigor.toFixed(1)}% nas zonas de baixo vigor e estresse. Cerca de ${areaDegradadaHa.toFixed(1)} hectares entraram em declínio. É imperativo investigar anomalias na irrigação, pragas agudas ou deficiências químicas.`;
    }

    // 6. Persistir Laudo na nova tabela de Comparação
    const payload = {
      fazenda_id: missaoAntiga.fazenda_id,
      talhao_id: talhaoId,
      missao_antiga_id: missaoAntigaId,
      missao_nova_id: missaoNovaId,
      delta_area_recuperada_ha: areaRecuperadaHa,
      delta_area_degradada_ha: areaDegradadaHa,
      ganho_vigor_percentual: deltaAltoVigor,
      laudo_texto: laudo,
      status_evolucao: statusEvolucao
    };

    const { error: errInsert } = await supabase
      .from("comparacoes_temporais")
      .insert(payload);

    if (errInsert) {
      console.error("Erro ao salvar o delta da inteligência temporal:", errInsert);
      return null;
    }

    return payload;

  } catch (error) {
    console.error("Motor Temporal Falhou:", error);
    return null;
  }
}
