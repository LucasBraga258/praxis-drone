import { supabaseAdmin as supabase } from "../../supabase/admin";
import { Logger } from "../../utils/logger";

export interface ContextoGeral {
  totalMissoes: number;
  clientes: any[];
  fazendas: any[];
}

export interface ContextoFazenda {
  fazenda: any;
  talhoes: any[];
  missoesRecentes: any[];
  intervencoesRecentes: any[];
  pragasAtivas: any[];
}

export interface ContextoTalhao {
  talhao: any;
  missoes: any[];
}

export const DashboardDBService = {
  /**
   * Busca um resumo geral do sistema (Fazendas, Clientes, Missões)
   */
  getContextoGeral: async (): Promise<ContextoGeral> => {
    try {
      const [
        { data: fazendas },
        { data: clientes },
        { count: totalMissoes },
      ] = await Promise.all([
        supabase.from("fazendas").select("id, nome, area_ha, cultura, status_saude, municipio, uf, proximo_voo").limit(20),
        supabase.from("clientes").select("id, nome").limit(20),
        supabase.from("projetos").select("*", { count: "exact", head: true }),
      ]);

      return {
        totalMissoes: totalMissoes || 0,
        clientes: clientes || [],
        fazendas: fazendas || []
      };
    } catch (error) {
      Logger.error("Erro ao buscar Contexto Geral", error);
      return { totalMissoes: 0, clientes: [], fazendas: [] };
    }
  },

  /**
   * Busca detalhes profundos de uma Fazenda Específica
   */
  getContextoFazenda: async (fazendaId: number): Promise<ContextoFazenda | null> => {
    try {
      const [
        { data: fazenda },
        { data: talhoes },
        { data: missoesRecentes },
        { data: intervencoesRecentes },
        { data: pragasAtivas },
      ] = await Promise.all([
        supabase.from("fazendas").select("*").eq("id", fazendaId).single(),
        supabase.from("talhoes").select("*").eq("fazenda_id", fazendaId),
        supabase.from("projetos").select("*").eq("fazenda_id", fazendaId).order("data_voo", { ascending: false }).limit(10),
        supabase.from("intervencoes").select("*").eq("fazenda_id", fazendaId).order("data_intervencao", { ascending: false }).limit(10),
        supabase.from("pragas").select("*").eq("fazenda_id", fazendaId).neq("status", "Resolvida"),
      ]);

      if (!fazenda) return null;

      return {
        fazenda,
        talhoes: talhoes || [],
        missoesRecentes: missoesRecentes || [],
        intervencoesRecentes: intervencoesRecentes || [],
        pragasAtivas: pragasAtivas || []
      };
    } catch (error) {
      Logger.error(`Erro ao buscar Contexto da Fazenda ${fazendaId}`, error);
      return null;
    }
  },

  /**
   * Busca contexto focado em um Talhão
   */
  getContextoTalhao: async (talhaoId: number): Promise<ContextoTalhao | null> => {
    try {
      const [{ data: talhao }, { data: missoes }] = await Promise.all([
        supabase.from("talhoes").select("*").eq("id", talhaoId).single(),
        supabase.from("projetos").select("*").eq("talhao_id", talhaoId).order("data_voo", { ascending: false }).limit(5),
      ]);

      if (!talhao) return null;

      return {
        talhao,
        missoes: missoes || []
      };
    } catch (error) {
      Logger.error(`Erro ao buscar Contexto do Talhão ${talhaoId}`, error);
      return null;
    }
  },

  /**
   * Consulta genérica para o MockProvider inteligente responder perguntas com SQL
   */
  contarRegistros: async (tabela: string): Promise<number> => {
    const { count } = await supabase.from(tabela).select("*", { count: "exact", head: true });
    return count || 0;
  },

  listarNotificacoesAtivas: async (): Promise<any[]> => {
    const { data } = await supabase.from("notificacoes").select("*").eq("lida", false).limit(10);
    return data || [];
  }
};
