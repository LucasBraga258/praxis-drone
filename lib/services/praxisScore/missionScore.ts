import { ResultadoValidacao }
from "../missionValidator/validador";

export interface MissionScore {

  score: number;

  nivel: string;

  cor: string;

  motivos: string[];

}

export function calcularMissionScore(
  resultado: ResultadoValidacao
): MissionScore {

  let score = 100;

  const motivos: string[] = [];

  // GPS

  if (resultado.fotosSemGPS > 0) {

    score -= 20;

    motivos.push(
      `${resultado.fotosSemGPS} foto(s) sem GPS`
    );

  } else {

    motivos.push(
      "Todas as fotos possuem GPS"
    );

  }

  // Datas

  if (
    resultado.avisos.includes(
      "Existem fotos de dias diferentes."
    )
  ) {

    score -= 10;

  }

  // Modelos

  if (
    resultado.avisos.includes(
      "Existem fotos de modelos diferentes."
    )
  ) {

    score -= 15;

  }

  // Resolução

  if (
    resultado.avisos.includes(
      "Existem fotos com resoluções diferentes."
    )
  ) {

    score -= 10;

  }

  if (score < 0)
    score = 0;

  let nivel = "";

  let cor = "";

  if (score >= 95) {

    nivel = "Excelente";

    cor = "green";

  }

  else if (score >= 85) {

    nivel = "Muito Boa";

    cor = "green";

  }

  else if (score >= 70) {

    nivel = "Boa";

    cor = "yellow";

  }

  else if (score >= 50) {

    nivel = "Atenção";

    cor = "orange";

  }

  else {

    nivel = "Crítica";

    cor = "red";

  }

  return {

    score,

    nivel,

    cor,

    motivos,

  };

}