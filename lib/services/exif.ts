/**
 * Serviço de Extração de Metadados EXIF
 *
 * Extrai dados GPS e técnicos de imagens de drone usando exifr.
 * Calcula bounding box, área do voo e rota usando @turf/turf.
 *
 * Funciona no client-side (browser) — nunca no servidor.
 */

import exifr from "exifr/dist/lite.esm.js";
import * as turf from "@turf/turf";

export interface ExifDados {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  heading: number | null;         // direção do voo em graus
  pitch: number | null;
  roll: number | null;
  timestamp: Date | null;
  drone_modelo: string | null;    // ex: "DJI Mavic 3"
  camera_modelo: string | null;   // ex: "FC3411"
  largura: number | null;
  altura: number | null;
  nome_arquivo: string;
}

export interface DadosVoo {
  coordenadas: ExifDados[];
  bbox: {
    norte: number;
    sul: number;
    leste: number;
    oeste: number;
    lat_centro: number;
    lng_centro: number;
  } | null;
  area_ha: number;
  distancia_km: number;           // distância total percorrida pelo drone
  qtd_fotos_com_gps: number;
  drone_modelo: string | null;
  camera_modelo: string | null;
}

/**
 * Extrai metadados EXIF de uma lista de arquivos de imagem.
 * Processa em lotes para não travar o browser.
 */
export async function extrairExifFotos(
  arquivos: File[],
  onProgress?: (processados: number, total: number) => void
): Promise<ExifDados[]> {
  const resultados: ExifDados[] = [];
  const LOTE = 20;

  for (let i = 0; i < arquivos.length; i += LOTE) {
    const lote = arquivos.slice(i, i + LOTE);

    const loteResultados = await Promise.all(
      lote.map(async (arquivo) => {
        try {
          const tags = await exifr.parse(arquivo, {
            gps: true,
            tiff: true,
            exif: true,
            xmp: true,
            iptc: false,
            jfif: false,
            ihdr: false,
          });

          if (!tags) {
            return criarExifVazio(arquivo.name);
          }

          // Drone DJI: modelo vem em Make + Model
          const drone_modelo = tags.Make && tags.Model
            ? `${tags.Make} ${tags.Model}`.trim()
            : tags.Model ?? tags.Make ?? null;

          // XMP do DJI tem dados de voo mais precisos
          const altitude =
            tags.RelativeAltitude != null
              ? parseFloat(String(tags.RelativeAltitude))
              : tags.GPSAltitude ?? null;

          const heading =
            tags.GimbalYawDegree != null
              ? parseFloat(String(tags.GimbalYawDegree))
              : tags.GPSImgDirection ?? null;

          const pitch =
            tags.GimbalPitchDegree != null
              ? parseFloat(String(tags.GimbalPitchDegree))
              : null;

          const roll =
            tags.GimbalRollDegree != null
              ? parseFloat(String(tags.GimbalRollDegree))
              : null;

          return {
            latitude: tags.latitude ?? null,
            longitude: tags.longitude ?? null,
            altitude,
            heading,
            pitch,
            roll,
            timestamp: tags.DateTimeOriginal ?? tags.CreateDate ?? null,
            drone_modelo,
            camera_modelo: tags.Model ?? null,
            largura: tags.ImageWidth ?? null,
            altura: tags.ImageHeight ?? null,
            nome_arquivo: arquivo.name,
          } as ExifDados;
        } catch {
          return criarExifVazio(arquivo.name);
        }
      })
    );

    resultados.push(...loteResultados);
    onProgress?.(Math.min(i + LOTE, arquivos.length), arquivos.length);
  }

  return resultados;
}

/**
 * Retorna EXIF vazio para arquivos sem metadados
 */
function criarExifVazio(nome_arquivo: string): ExifDados {
  return {
    latitude: null,
    longitude: null,
    altitude: null,
    heading: null,
    pitch: null,
    roll: null,
    timestamp: null,
    drone_modelo: null,
    camera_modelo: null,
    largura: null,
    altura: null,
    nome_arquivo,
  };
}

/**
 * Calcula todos os dados do voo a partir dos metadados EXIF extraídos.
 */
export function calcularDadosVoo(exifs: ExifDados[]): DadosVoo {
  // Filtra apenas fotos com GPS válido
  const comGPS = exifs.filter(
    (e) => e.latitude != null && e.longitude != null
  );

  // Drone e câmera mais comuns (moda)
  const drone_modelo = modaString(exifs.map((e) => e.drone_modelo));
  const camera_modelo = modaString(exifs.map((e) => e.camera_modelo));

  if (comGPS.length === 0) {
    return {
      coordenadas: exifs,
      bbox: null,
      area_ha: 0,
      distancia_km: 0,
      qtd_fotos_com_gps: 0,
      drone_modelo,
      camera_modelo,
    };
  }

  // Ordenar por timestamp para calcular rota corretamente
  const ordenados = [...comGPS].sort((a, b) => {
    if (!a.timestamp || !b.timestamp) return 0;
    return a.timestamp.getTime() - b.timestamp.getTime();
  });

  // Bounding Box
  const lats = comGPS.map((e) => e.latitude!);
  const lngs = comGPS.map((e) => e.longitude!);
  const norte = Math.max(...lats);
  const sul = Math.min(...lats);
  const leste = Math.max(...lngs);
  const oeste = Math.min(...lngs);
  const lat_centro = (norte + sul) / 2;
  const lng_centro = (leste + oeste) / 2;

  // Área estimada do bounding box em hectares (usando turf)
  let area_ha = 0;
  try {
    const bboxPoly = turf.bboxPolygon([oeste, sul, leste, norte]);
    area_ha = turf.area(bboxPoly) / 10000;
  } catch {
    // fallback simples
    const dLat = norte - sul;
    const dLng = leste - oeste;
    area_ha = dLat * dLng * 12321; // aprox em ha
  }

  // Distância total percorrida (linha de voo)
  let distancia_km = 0;
  try {
    if (ordenados.length >= 2) {
      const coords = ordenados.map((e) => [e.longitude!, e.latitude!]);
      const linha = turf.lineString(coords);
      distancia_km = turf.length(linha, { units: "kilometers" });
    }
  } catch {
    distancia_km = 0;
  }

  return {
    coordenadas: exifs,
    bbox: { norte, sul, leste, oeste, lat_centro, lng_centro },
    area_ha: parseFloat(area_ha.toFixed(2)),
    distancia_km: parseFloat(distancia_km.toFixed(2)),
    qtd_fotos_com_gps: comGPS.length,
    drone_modelo,
    camera_modelo,
  };
}

/**
 * Retorna o valor mais frequente de uma lista (moda), ignorando nulls.
 */
function modaString(valores: (string | null)[]): string | null {
  const validos = valores.filter((v): v is string => v != null);
  if (validos.length === 0) return null;

  const contagem: Record<string, number> = {};
  for (const v of validos) {
    contagem[v] = (contagem[v] ?? 0) + 1;
  }

  return Object.entries(contagem).sort((a, b) => b[1] - a[1])[0][0];
}
