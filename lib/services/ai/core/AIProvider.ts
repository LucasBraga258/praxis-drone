export interface AIProvider {
  /**
   * Nome de identificação do provedor (ex: "Gemini", "Ollama", "Mock")
   */
  readonly name: string;

  /**
   * Gera uma resposta da IA baseada na pergunta, histórico e contexto.
   */
  generateResponse(
    pergunta: string,
    historico: { role: "user" | "model"; parts: string }[],
    contexto: string
  ): Promise<string>;
}
