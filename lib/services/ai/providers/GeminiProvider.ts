import { AIProvider } from "../core/AIProvider";
import { GoogleGenAI } from "@google/genai";
import { Logger } from "../../../utils/logger";

export class GeminiProvider implements AIProvider {
  name = "Gemini";
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      Logger.warn("GEMINI_API_KEY não encontrada no .env. GeminiProvider pode falhar.");
    }
  }

  async generateResponse(
    pergunta: string,
    historico: { role: "user" | "model"; parts: string }[],
    contexto: string
  ): Promise<string> {
    if (!this.ai) {
      throw new Error("Gemini API Key não configurada.");
    }

    const systemInstruction = `Você é o **Assistente Agronômico Praxis** — um especialista em Agricultura de Precisão.

Você tem acesso a dados reais da plataforma Praxis sobre fazendas, talhões, missões de drone, intervenções e pragas.

**Regras:**
- Responda sempre em português brasileiro
- Seja objetivo e profissional, mas acessível ao produtor rural
- NUNCA tome decisões — apenas apresente informações e análises
- Baseie suas respostas nos dados fornecidos
- Se não tiver dados suficientes, diga claramente
- Use formatação markdown quando útil (listas, negrito)
- Responda em no máximo 3 parágrafos, a menos que o usuário peça detalhes

**Contexto atual da plataforma:**
${contexto}`;

    const contents = [
      ...historico.map((h) => ({
        role: h.role,
        parts: [{ text: h.parts }],
      })),
      {
        role: "user" as const,
        parts: [{ text: pergunta }],
      },
    ];

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
        config: {
          systemInstruction,
          maxOutputTokens: 1024,
          temperature: 0.4,
        },
      });

      return response.text ?? "Não consegui gerar uma resposta pelo Gemini. Tente novamente.";
    } catch (error: any) {
      Logger.error("Erro no GeminiProvider:", error.message || error);
      throw error; // Repassa o erro para o Fallback capturar
    }
  }
}
