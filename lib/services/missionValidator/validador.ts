import * as exifr from "exifr";
import { traduzirDrone } from "./traduzirDrone";

export interface MetadadosFoto {
  nome: string;

  fabricante?: string;

  modelo?: string;

  largura?: number;

  altura?: number;

  latitude?: number;

  longitude?: number;

  altitude?: number;

  data?: Date;
}

export interface ResultadoValidacao {
  quantidadeFotos: number;

  tamanhoTotal: number;

  drone?: string;

  fabricante?: string;

  largura?: number;

  altura?: number;

  latitude?: number;

  longitude?: number;

  altitude?: number;

  dataVoo?: Date;

  fotosComGPS: number;

  fotosSemGPS: number;

  altitudeMinima?: number;

  altitudeMaxima?: number;

  altitudeMedia?: number;

  erros: string[];

  avisos: string[];
}

export async function validarFotos(
  arquivos: File[]
): Promise<ResultadoValidacao> {

  const metadados =
    await extrairMetadados(arquivos);

  return validarMetadados(
    arquivos,
    metadados
  );

}

async function extrairMetadados(
  arquivos: File[]
): Promise<MetadadosFoto[]> {

  const fotos: MetadadosFoto[] = [];

  for (const foto of arquivos) {

    const exif =
      await exifr.parse(foto);

    fotos.push({

      nome: foto.name,

      fabricante:
        exif?.Make,

      modelo:
        exif?.Model,

      largura:
        exif?.ExifImageWidth ||
        exif?.ImageWidth,

      altura:
        exif?.ExifImageHeight ||
        exif?.ImageHeight,

      latitude:
        exif?.latitude,

      longitude:
        exif?.longitude,

      altitude:
        exif?.GPSAltitude,

      data:
        exif?.CreateDate,

    });

  }

  console.table(fotos);

  return fotos;

}

function validarMetadados(
  arquivos: File[],
  fotos: MetadadosFoto[]
): ResultadoValidacao {

  const resultado: ResultadoValidacao = {

    quantidadeFotos: arquivos.length,

    tamanhoTotal: arquivos.reduce(
      (acc, arquivo) => acc + arquivo.size,
      0
    ),

    fotosComGPS: 0,

    fotosSemGPS: 0,

    erros: [],

    avisos: [],

  };

  if (!fotos.length) {

    resultado.erros.push(
      "Nenhuma foto foi enviada."
    );

    return resultado;

  }

  const primeira = fotos[0];

  resultado.drone =
    traduzirDrone(primeira.modelo);

  resultado.fabricante =
    primeira.fabricante;

  resultado.latitude =
    primeira.latitude;

  resultado.longitude =
    primeira.longitude;

  resultado.altitude =
    primeira.altitude;

  resultado.dataVoo =
    primeira.data;

  resultado.largura =
    primeira.largura;

  resultado.altura =
    primeira.altura;

  // ===========================
  // GPS
  // ===========================

  const fotosComGPS = fotos.filter(

    foto =>

      foto.latitude != null &&
      foto.longitude != null

  ).length;

  const fotosSemGPS =
    fotos.length - fotosComGPS;

  resultado.fotosComGPS =
    fotosComGPS;

  resultado.fotosSemGPS =
    fotosSemGPS;

  if (fotosSemGPS > 0) {

    resultado.avisos.push(
      `${fotosSemGPS} foto(s) sem GPS.`
    );

  }

  // ===========================
  // Altitude
  // ===========================

  const altitudes = fotos

    .map(f => f.altitude)

    .filter(
      (a): a is number =>
        a != null
    );

  if (altitudes.length) {

    resultado.altitudeMinima =
      Math.min(...altitudes);

    resultado.altitudeMaxima =
      Math.max(...altitudes);

    resultado.altitudeMedia =

      altitudes.reduce(
        (a, b) => a + b,
        0
      ) / altitudes.length;

  }

  // ===========================
  // Modelos
  // ===========================

  const modelos = [

    ...new Set(

      fotos.map(
        foto => foto.modelo
      )

    ),

  ];

  if (modelos.length > 1) {

    resultado.avisos.push(
      "Existem fotos de modelos diferentes."
    );

  }

  // ===========================
  // Fabricantes
  // ===========================

  const fabricantes = [

    ...new Set(

      fotos.map(
        foto => foto.fabricante
      )

    ),

  ];

  if (fabricantes.length > 1) {

    resultado.avisos.push(
      "Existem fabricantes diferentes."
    );

  }

  // ===========================
  // Resoluções
  // ===========================

  const resolucoes = [

    ...new Set(

      fotos.map(
        foto =>
          `${foto.largura}x${foto.altura}`
      )

    ),

  ];

  if (resolucoes.length > 1) {

    resultado.avisos.push(
      "Existem fotos com resoluções diferentes."
    );

  }

  // ===========================
  // Datas
  // ===========================

  const datas = [

    ...new Set(

      fotos.map(
        foto =>
          foto.data?.toDateString()
      )

    ),

  ];

  if (datas.length > 1) {

    resultado.avisos.push(
      "Existem fotos de dias diferentes."
    );

  }

  // ===========================
  // Logs
  // ===========================

  console.log("Fotos:", fotos.length);

  console.log("GPS:", fotosComGPS);

  console.log("Altitude média:", resultado.altitudeMedia);

  console.log("Modelos:", modelos);

  console.log("Fabricantes:", fabricantes);

  console.log("Resoluções:", resolucoes);

  console.log("Datas:", datas);

  return resultado;

}