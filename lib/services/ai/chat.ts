import { DashboardDBService } from "./dbService";
import { AIProviderFactory } from "./AIProviderFactory";
import { Logger } from "../../utils/logger";

interface ChatContext {
  fazendaId?: number;
  talhaoId?: number;
  projetoId?: string;
}

/**
 * Busca todo o contexto da fazenda ou geral de forma estruturada.
 */
export async function buscarContextoPropriedade({
  fazendaId,
  talhaoId,
  projetoId,
}: ChatContext) {
  try {
    let contexto = "";

    // 1. Contexto Específico do Talhão
    if (talhaoId) {
      const contextoTalhao = await DashboardDBService.getContextoTalhao(talhaoId);
      if (contextoTalhao) {
        contexto += `**Foco da conversa:** Talhão "${contextoTalhao.talhao.nome}" (Cultura: ${contextoTalhao.talhao.cultura}, Área: ${contextoTalhao.talhao.area_ha || contextoTalhao.talhao.area || 0} ha).\n`;
        contexto += `Possui ${contextoTalhao.missoes.length} missão(ões) vinculada(s).\n\n`;
      }
    }

    // 2. Contexto da Fazenda
    if (fazendaId) {
      const contextoFazenda = await DashboardDBService.getContextoFazenda(fazendaId);
      if (contextoFazenda) {
        contexto += `**Fazenda selecionada:** ${contextoFazenda.fazenda.nome} (${contextoFazenda.fazenda.cidade}-${contextoFazenda.fazenda.estado})\n`;
        contexto += `Área total: ${contextoFazenda.fazenda.area_ha || 0} ha. Cultura principal: ${contextoFazenda.fazenda.cultura || "—"}.\n`;
        contexto += `Status de Saúde: ${contextoFazenda.fazenda.status_saude || "—"}.\n`;
        contexto += `Possui ${contextoFazenda.talhoes.length} talhões cadastrados.\n`;
        contexto += `Missões de drone recentes: ${contextoFazenda.missoesRecentes.length}.\n`;
        contexto += `Intervenções agronômicas: ${contextoFazenda.intervencoesRecentes.length}.\n`;
        
        if (contextoFazenda.pragasAtivas.length > 0) {
          contexto += `⚠️ ALERTA: Há ${contextoFazenda.pragasAtivas.length} pragas/doenças não resolvidas registradas.\n`;
        }
        contexto += "\n";
      }
    }

    // 3. Contexto Geral da Plataforma (se não filtrou por fazenda/talhão)
    if (!fazendaId && !talhaoId) {
      const contextoGeral = await DashboardDBService.getContextoGeral();
      contexto += `**Visão Geral do Sistema Praxis**\n`;
      contexto += `- Total de Clientes: ${contextoGeral.clientes.length}\n`;
      contexto += `- Total de Fazendas: ${contextoGeral.fazendas.length}\n`;
      contexto += `- Área Total Monitorada: ${contextoGeral.areaTotal.toFixed(2)} ha\n`;
      contexto += `- Total de Missões de Drone/Satélite: ${contextoGeral.totalMissoes}\n\n`;
    }

    return contexto || "Nenhum dado específico selecionado. Responda de forma geral sobre a plataforma Praxis.";
  } catch (error) {
    Logger.error("Erro ao montar contexto para a IA", error);
    return "Não foi possível carregar o contexto da plataforma.";
  }
}

/**
 * Envia uma mensagem para a IA utilizando a arquitetura Híbrida (Factory).
 */
export async function enviarMensagemIA(
  pergunta: string,
  historico: { role: "user" | "model"; parts: string }[],
  contexto: string
): Promise<string> {
  const factory = AIProviderFactory.getInstance();
  return factory.generateResponse(pergunta, historico, contexto);
}
