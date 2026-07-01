import { AIProvider } from "./core/AIProvider";
import { GeminiProvider } from "./providers/GeminiProvider";
import { OllamaProvider } from "./providers/OllamaProvider";
import { MockProvider } from "./providers/MockProvider";
import { Logger } from "../../utils/logger";
import fs from "fs";
import path from "path";

const TIMEOUT_MS = 20000; // 20 segundos

export class AIProviderFactory {
  private static instance: AIProviderFactory;
  private mockFallback: AIProvider;
  private providersCache: Record<string, AIProvider> = {};

  private constructor() {
    this.mockFallback = new MockProvider();
    this.providersCache["mock"] = this.mockFallback;
    this.providersCache["gemini"] = new GeminiProvider();
    this.providersCache["ollama"] = new OllamaProvider();
  }

  public static getInstance(): AIProviderFactory {
    if (!AIProviderFactory.instance) {
      AIProviderFactory.instance = new AIProviderFactory();
    }
    return AIProviderFactory.instance;
  }

  private getActiveProvider(): AIProvider {
    let configuredProvider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
    
    try {
      const configPath = path.join(process.cwd(), "ai-config.json");
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        if (config.aiProvider) configuredProvider = config.aiProvider.toLowerCase();
      }
    } catch (e) {
      // Ignore
    }

    const provider = this.providersCache[configuredProvider];
    if (provider) return provider;
    
    Logger.warn(`AI_PROVIDER "${configuredProvider}" desconhecido. Utilizando Gemini.`);
    return this.providersCache["gemini"];
  }

  /**
   * Retorna o provedor atual configurado.
   */
  public getCurrentProviderName(): string {
    return this.getActiveProvider().name;
  }

  /**
   * Orquestra a requisição. Adiciona Timeout e Fallback automático.
   */
  public async generateResponse(
    pergunta: string,
    historico: { role: "user" | "model"; parts: string }[],
    contexto: string
  ): Promise<string> {
    // Roteador Inteligente Pré-Processamento
    // Se for uma pergunta simples mapeada pro Banco (ex: "quantas fazendas"), a Factory já desvia pro Mock pra salvar API
    const p = pergunta.toLowerCase();
    if (p.includes("quantas fazendas") || p.includes("quantos clientes") || p.includes("quantas interven")) {
      Logger.info("Roteador Inteligente: Pergunta simples detectada. Direcionando para DB/MockProvider.");
      return this.mockFallback.generateResponse(pergunta, historico, contexto);
    }

    // Se exige análise real, envia pro Provedor Configurado com Timeout
    return this.executeWithTimeoutAndFallback(pergunta, historico, contexto);
  }

  private async executeWithTimeoutAndFallback(
    pergunta: string,
    historico: { role: "user" | "model"; parts: string }[],
    contexto: string
  ): Promise<string> {
    
    const activeProvider = this.getActiveProvider();
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout_Atingido")), TIMEOUT_MS);
    });

    try {
      Logger.info(`Iniciando geração de IA via ${activeProvider.name}...`);
      
      const resposta = await Promise.race([
        activeProvider.generateResponse(pergunta, historico, contexto),
        timeoutPromise
      ]);

      return resposta;

    } catch (error: any) {
      Logger.error(`Falha no provedor ${activeProvider.name}. Acionando Fallback.`, error);
      
      const motivo = error.message === "Timeout_Atingido" 
        ? "o provedor demorou mais de 20 segundos para responder"
        : "ocorreu um erro técnico na comunicação da rede/chave";

      // Fallback Inteligente (sempre cai no Mock, que explica amigavelmente)
      const respostaMock = await this.mockFallback.generateResponse(pergunta, historico, contexto);

      return `⚠️ **Aviso de Fallback Automático**\nNão foi possível utilizar o provedor configurado (${activeProvider.name}) pois ${motivo}. Utilizando modo local offline.\n\n---\n\n${respostaMock}`;
    }
  }
}
