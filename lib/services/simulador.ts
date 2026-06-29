import {
  atualizarEtapaPipeline,
  concluirEtapaPipeline,
  iniciarEtapaPipeline,
} from "./processamento";

interface EtapaPipeline {
  nome: string;
  intervalo: number;
  progresso: number[];
}

const etapas: EtapaPipeline[] = [
  {
    nome: "OpenDroneMap",
    intervalo: 1400,
    progresso: [5, 15, 30, 45, 60, 75, 90, 100],
  },
  {
    nome: "Ortomosaico",
    intervalo: 1100,
    progresso: [10, 25, 40, 55, 70, 85, 100],
  },
  {
    nome: "NDVI",
    intervalo: 900,
    progresso: [10, 30, 50, 70, 90, 100],
  },
  {
    nome: "Modelo de Elevação",
    intervalo: 800,
    progresso: [20, 40, 60, 80, 100],
  },
  {
    nome: "IA Praxis",
    intervalo: 700,
    progresso: [15, 35, 60, 85, 100],
  },
  {
    nome: "Relatório",
    intervalo: 600,
    progresso: [20, 50, 80, 100],
  },
  {
    nome: "Entrega",
    intervalo: 500,
    progresso: [100],
  },
];

export async function simularPipeline(
  projetoId: number
) {
  for (const etapa of etapas) {

    await iniciarEtapaPipeline(
      projetoId,
      etapa.nome
    );

    for (const progresso of etapa.progresso) {

      await atualizarEtapaPipeline(
        projetoId,
        etapa.nome,
        "Processando",
        progresso
      );

      const variacao =
        Math.floor(Math.random() * 600);

      await esperar(
        etapa.intervalo + variacao
      );

    }

    await concluirEtapaPipeline(
      projetoId,
      etapa.nome
    );

    await esperar(500);
  }
}

function esperar(ms: number) {
  return new Promise(resolve =>
    setTimeout(resolve, ms)
  );
}