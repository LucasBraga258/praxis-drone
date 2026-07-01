import { AIProvider } from "../core/AIProvider";
import { DashboardDBService } from "../dbService";
import { Logger } from "../../../utils/logger";
import { createClient } from "../../../supabase/client";
import { supabaseAdmin } from "../../../supabase/admin";

const supabase = supabaseAdmin;

export class MockProvider implements AIProvider {
  name = "Mock (DB Local)";

  async generateResponse(
    pergunta: string,
    historico: { role: "user" | "model"; parts: string }[],
    contexto: string
  ): Promise<string> {
    Logger.info("MockProvider acionado para responder à pergunta", { pergunta });
    
    const p = pergunta.toLowerCase();

    try {
      // 1. Contagens básicas
      if (p.includes("quantas fazendas") || p.includes("total de fazendas")) {
        const count = await DashboardDBService.contarRegistros("fazendas");
        return `Atualmente, você possui **${count} fazenda(s)** cadastradas na plataforma. *(Resposta gerada via SQL Local)*`;
      }
      
      if (p.includes("quantos clientes") || p.includes("total de clientes")) {
        const count = await DashboardDBService.contarRegistros("clientes");
        return `Existem **${count} cliente(s)** cadastrados no sistema. *(Resposta gerada via SQL Local)*`;
      }
      
      if (p.includes("quantas intervenções") || p.includes("total de interven")) {
        const count = await DashboardDBService.contarRegistros("intervencoes");
        return `Há um total de **${count} intervenção(ões)** registradas. *(Resposta gerada via SQL Local)*`;
      }

      // 2. Saúde das Fazendas
      if (p.includes("saúde das minhas fazendas")) {
        const { data } = await supabase.from("fazendas").select("nome, status_saude");
        if (!data || data.length === 0) return "Não há fazendas cadastradas para avaliar a saúde.";
        
        let resposta = "**Resumo de Saúde (SQL Local):**\n";
        data.forEach(f => {
          resposta += `- **${f.nome}**: ${f.status_saude || "Sem avaliação"}\n`;
        });
        return resposta;
      }

      // 3. Monitoramentos vencidos
      if (p.includes("monitoramentos vencidos") || (p.includes("monitoramentos") && p.includes("venceram"))) {
        const alertas = await DashboardDBService.listarNotificacoesAtivas();
        const vencidos = alertas.filter(a => a.tipo === "vencido" || a.titulo.toLowerCase().includes("vencido"));
        if (vencidos.length > 0) {
          return `Existem **${vencidos.length}** alertas de monitoramento vencido ou prestes a vencer. Verifique a central de alertas para detalhes. *(SQL Local)*`;
        }
        return `No momento não encontrei monitoramentos vencidos em destaque nos alertas. *(SQL Local)*`;
      }

      // 4. Pragas Ativas
      if (p.includes("pragas ativas")) {
        const { data } = await supabase.from("pragas").select("nome, severidade, status").neq("status", "Resolvida");
        if (!data || data.length === 0) return "Ótima notícia! Não encontrei pragas ativas registradas no sistema. *(SQL Local)*";
        
        let resposta = `Atenção, há **${data.length} praga(s)** precisando de atenção:\n`;
        data.forEach(praga => {
          resposta += `- **${praga.nome}** (Severidade: ${praga.severidade}) - Status: ${praga.status}\n`;
        });
        return resposta;
      }

      // 5. Área total monitorada
      if (p.includes("área total monitorada")) {
        const { data } = await supabase.from("talhoes").select("area");
        if (!data) return "Não consegui calcular a área no momento.";
        const total = data.reduce((acc, curr) => acc + (Number(curr.area) || 0), 0);
        return `A área total monitorada atualizada somando seus talhões é de **${total.toFixed(2)} hectares**. *(SQL Local)*`;
      }

      // 6. Resumo das últimas missões
      if (p.includes("últimas missões")) {
        const { data } = await supabase.from("projetos").select("codigo, data_voo, status").order("data_voo", { ascending: false }).limit(3);
        if (!data || data.length === 0) return "Não há missões registradas no momento.";
        let resposta = "**Últimas 3 Missões Realizadas (SQL Local):**\n";
        data.forEach(m => {
          resposta += `- **${m.codigo}**: ${new Date(m.data_voo).toLocaleDateString('pt-BR')} (${m.status})\n`;
        });
        return resposta;
      }

    } catch (err) {
      Logger.error("Erro interno no MockProvider ao buscar SQL", err);
    }

    // Fallback genérico para perguntas analíticas (ex: "Compare o vigor")
    return `ℹ️ **Aviso do Sistema Local**\n\nEu sou o provedor local de rotinas de banco (Mock). A pergunta que você fez ("*${pergunta}*") requer análise interpretativa (como comparar vigor ou ler imagens). \n\nNo momento, o sistema está configurado para não gastar inteligência artificial avançada para isso. Selecione **Ollama** ou **Gemini** em Configurações para obter essa análise.`;
  }
}
