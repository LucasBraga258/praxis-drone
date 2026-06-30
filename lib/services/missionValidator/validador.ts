import * as exifr from "exifr";
import { traduzirDrone } from "./traduzirDrone";
import type { MetadadosFoto, ResultadoValidacao } from "./interfaces";

export type { MetadadosFoto, ResultadoValidacao };

const EXTENSOES_VALIDAS = new Set([
  ".jpg",
  ".jpeg",
  ".tif",
  ".tiff",
]);

const TAMANHO_MINIMO = 100 * 1024; // 100 KB
const QUANTIDADE_MINIMA = 5;

export async function validarFotos(
  arquivos: File[]
): Promise<ResultadoValidacao> {
  const metadados = await extrairMetadados(arquivos);
  return validarMetadados(arquivos, metadados);
}

async function extrairMetadados(
  arquivos: File[]
): Promise<MetadadosFoto[]> {
  const fotos: MetadadosFoto[] = [];

  for (const foto of arquivos) {
    try {
      const exif = await exifr.parse(foto);

      fotos.push({
        nome: foto.name,
        fabricante: exif?.Make,
        modelo: exif?.Model,
        largura: exif?.ExifImageWidth || exif?.ImageWidth,
        altura: exif?.ExifImageHeight || exif?.ImageHeight,
        latitude: exif?.latitude,
        longitude: exif?.longitude,
        altitude: exif?.GPSAltitude,
        data: exif?.CreateDate,
      });
    } catch {
      fotos.push({ nome: foto.name });
    }
  }

  return fotos;
}

function validarMetadados(
  arquivos: File[],
  fotos: MetadadosFoto[]
): ResultadoValidacao {
  const resultado: ResultadoValidacao = {
    quantidadeFotos: arquivos.length,
    tamanhoTotal: arquivos.reduce((acc, a) => acc + a.size, 0),
    fotosComGPS: 0,
    fotosSemGPS: 0,
    erros: [],
    avisos: [],
  };

  if (!fotos.length) {
    resultado.erros.push("Nenhuma foto foi enviada.");
    return resultado;
  }

  // === Extensão ===
  const invalidos = arquivos.filter((a) => {
    const ext = "." + a.name.split(".").pop()?.toLowerCase();
    return !EXTENSOES_VALIDAS.has(ext);
  });

  if (invalidos.length > 0) {
    resultado.erros.push(
      `${invalidos.length} arquivo(s) com extensão inválida: ${invalidos
        .slice(0, 3)
        .map((a) => a.name)
        .join(", ")}${invalidos.length > 3 ? "..." : ""}`
    );
  }

  // === Duplicatas ===
  const nomes = arquivos.map((a) => a.name);
  const duplicatas = nomes.filter(
    (nome, i) => nomes.indexOf(nome) !== i
  );

  if (duplicatas.length > 0) {
    resultado.avisos.push(
      `${duplicatas.length} arquivo(s) duplicado(s) detectado(s).`
    );
  }

  // === Tamanho mínimo ===
  const pequenos = arquivos.filter((a) => a.size < TAMANHO_MINIMO);
  if (pequenos.length > 0) {
    resultado.avisos.push(
      `${pequenos.length} arquivo(s) muito pequeno(s) (< 100 KB).`
    );
  }

  // === Quantidade mínima ===
  if (arquivos.length < QUANTIDADE_MINIMA) {
    resultado.avisos.push(
      `Quantidade baixa de imagens (${arquivos.length}). Recomendado mínimo de ${QUANTIDADE_MINIMA}.`
    );
  }

  // === Drone/Fabricante ===
  const primeira = fotos[0];
  resultado.drone = traduzirDrone(primeira.modelo);
  resultado.fabricante = primeira.fabricante;
  resultado.latitude = primeira.latitude;
  resultado.longitude = primeira.longitude;
  resultado.altitude = primeira.altitude;
  resultado.dataVoo = primeira.data;
  resultado.largura = primeira.largura;
  resultado.altura = primeira.altura;

  // === GPS ===
  const fotosComGPS = fotos.filter(
    (f) => f.latitude != null && f.longitude != null
  ).length;

  resultado.fotosComGPS = fotosComGPS;
  resultado.fotosSemGPS = fotos.length - fotosComGPS;

  if (resultado.fotosSemGPS > 0) {
    resultado.avisos.push(
      `${resultado.fotosSemGPS} foto(s) sem GPS.`
    );
  }

  // === Altitude ===
  const altitudes = fotos
    .map((f) => f.altitude)
    .filter((a): a is number => a != null);

  if (altitudes.length) {
    resultado.altitudeMinima = Math.min(...altitudes);
    resultado.altitudeMaxima = Math.max(...altitudes);
    resultado.altitudeMedia =
      altitudes.reduce((a, b) => a + b, 0) / altitudes.length;
  }

  // === Modelos ===
  const modelos = [...new Set(fotos.map((f) => f.modelo))];
  if (modelos.length > 1) {
    resultado.avisos.push("Existem fotos de modelos diferentes.");
  }

  // === Fabricantes ===
  const fabricantes = [...new Set(fotos.map((f) => f.fabricante))];
  if (fabricantes.length > 1) {
    resultado.avisos.push("Existem fabricantes diferentes.");
  }

  // === Resoluções ===
  const resolucoes = [
    ...new Set(fotos.map((f) => `${f.largura}x${f.altura}`)),
  ];
  if (resolucoes.length > 1) {
    resultado.avisos.push("Existem fotos com resoluções diferentes.");
  }

  // === Datas ===
  const datas = [
    ...new Set(fotos.map((f) => f.data?.toDateString())),
  ];
  if (datas.length > 1) {
    resultado.avisos.push("Existem fotos de dias diferentes.");
  }

  return resultado;
}