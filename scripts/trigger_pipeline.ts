import { executarPipelineAssincrono } from "./lib/services/pipeline";

async function main() {
  console.log("Iniciando pipeline manualmente para o Projeto 6...");
  try {
    await executarPipelineAssincrono("6");
    console.log("Pipeline iniciado com sucesso!");
  } catch (error) {
    console.error("Erro:", error);
  }
}

main();
