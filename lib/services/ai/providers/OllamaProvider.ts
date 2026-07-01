import { AIProvider } from "../core/AIProvider";
import { Logger } from "../../../utils/logger";

export class OllamaProvider implements AIProvider {
  name = "Ollama (Local)";
  private apiUrl = "http://localhost:11434/api/generate";

  async generateResponse(
    pergunta: string,
    historico: { role: "user" | "model"; parts: string }[],
    contexto: string
  ): Promise<string> {
    const promptCompleto = `Você é o Assistente Agronômico Praxis.
Contexto do Banco:
${contexto}

Histórico da Conversa:
${historico.map(h => `${h.role === 'user' ? 'Usuário' : 'IA'}: ${h.parts}`).join('\n')}

Usuário: ${pergunta}
Assistente:`;

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen3:8b", // Modelo configurado pelo usuário
          prompt: promptCompleto,
          stream: false,
          options: {
            temperature: 0.4
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API falhou com status: ${response.status}`);
      }

      const data = await response.json();
      return data.response ?? "Não consegui gerar resposta via Ollama.";
    } catch (error: any) {
      Logger.error("Erro no OllamaProvider:", error.message || error);
      throw error; // Repassa pro Fallback
    }
  }
}
