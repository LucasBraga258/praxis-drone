/**
 * Serviço de Upload de Fotos
 *
 * Orquestra:
 * 1. Upload paralelo (lotes de 10) para Supabase Storage
 * 2. Extração automática de EXIF (GPS, drone, câmera)
 * 3. Registro dos arquivos no banco com metadados EXIF
 * 4. Atualização do projeto com bbox e centro do voo
 * 5. Disparo do pipeline de processamento
 */

import { uploadArquivo } from "./storage";
import { registrarArquivos } from "./arquivos";
import { atualizarStatusProjeto } from "./projetos";
import { extrairExifFotos, calcularDadosVoo } from "./exif";
import type { DadosVoo } from "./exif";
import { createClient } from "../supabase/client";

const supabase = createClient();

export interface UploadProgress {
  percentual: number;
  enviados: number;
  total: number;
  arquivoAtual: string;
  fase: "upload" | "exif" | "concluido";
}

export interface UploadResultado {
  totalEnviadas: number;
  totalComGPS: number;
  dadosVoo: DadosVoo | null;
}

export async function uploadFotosProjeto(
  projetoId: number,
  arquivos: File[],
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResultado> {
  const registros: any[] = [];
  const TAMANHO_LOTE = 10;
  let enviadosTotais = 0;

  // ─────────────────────────────────────────────────────────
  // FASE 1: EXIF (client-side, antes do upload)
  // ─────────────────────────────────────────────────────────
  onProgress?.({
    percentual: 0,
    enviados: 0,
    total: arquivos.length,
    arquivoAtual: "Extraindo metadados GPS das fotos...",
    fase: "exif",
  });

  let exifDados: Awaited<ReturnType<typeof extrairExifFotos>> = [];
  try {
    exifDados = await extrairExifFotos(
      arquivos,
      (processados, total) => {
        onProgress?.({
          percentual: Math.round((processados / total) * 10), // 0-10% para EXIF
          enviados: 0,
          total: arquivos.length,
          arquivoAtual: `Analisando GPS: ${processados}/${total} fotos`,
          fase: "exif",
        });
      }
    );
  } catch (err) {
    console.warn("[Upload] Extração EXIF falhou, continuando sem GPS:", err);
  }

  // Mapa nome → exif para lookup rápido
  const exifMap = new Map(exifDados.map((e) => [e.nome_arquivo, e]));

  // ─────────────────────────────────────────────────────────
  // FASE 2: UPLOAD
  // ─────────────────────────────────────────────────────────
  for (let i = 0; i < arquivos.length; i += TAMANHO_LOTE) {
    const lote = arquivos.slice(i, i + TAMANHO_LOTE);

    const resultadosLote = await Promise.all(
      lote.map(async (arquivo) => {
        const nomeArquivo = `${Date.now()}-${arquivo.name}`;
        const caminho = `${projetoId}/fotos/${nomeArquivo}`;

        try {
          const publicUrl = await uploadArquivo("missoes", caminho, arquivo);

          const exif = exifMap.get(arquivo.name);

          return {
            projeto_id: projetoId,
            nome: arquivo.name,
            caminho,
            bucket: "missoes",
            url: publicUrl,
            tipo: "foto",
            tamanho: arquivo.size,
            origem: "Upload",
            status: "Disponível",
            processado: false,
            // Metadados EXIF no campo metadata (JSONB)
            metadata: exif
              ? {
                  latitude: exif.latitude,
                  longitude: exif.longitude,
                  altitude: exif.altitude,
                  heading: exif.heading,
                  pitch: exif.pitch,
                  roll: exif.roll,
                  timestamp: exif.timestamp?.toISOString() ?? null,
                  drone_modelo: exif.drone_modelo,
                  camera_modelo: exif.camera_modelo,
                  largura: exif.largura,
                  altura: exif.altura,
                  exif_extraido: exif.latitude != null,
                }
              : null,
          };
        } catch (err) {
          console.error(`[Upload] Falha no arquivo ${arquivo.name}:`, err);
          return null;
        }
      })
    );

    const sucessos = resultadosLote.filter((res) => res !== null);
    registros.push(...sucessos);

    enviadosTotais += lote.length;
    const percentualUpload = Math.round((enviadosTotais / arquivos.length) * 85); // 0-85%

    onProgress?.({
      percentual: 10 + percentualUpload,
      enviados: enviadosTotais,
      total: arquivos.length,
      arquivoAtual: `Enviando: ${enviadosTotais}/${arquivos.length} fotos`,
      fase: "upload",
    });
  }

  // ─────────────────────────────────────────────────────────
  // FASE 3: REGISTRAR NO BANCO
  // ─────────────────────────────────────────────────────────
  await registrarArquivos(registros);

  // ─────────────────────────────────────────────────────────
  // FASE 4: CALCULAR DADOS DO VOO E ATUALIZAR PROJETO
  // ─────────────────────────────────────────────────────────
  let dadosVoo: DadosVoo | null = null;
  try {
    if (exifDados.length > 0) {
      dadosVoo = calcularDadosVoo(exifDados);

      if (dadosVoo.bbox) {
        let municipio = undefined;
        let uf = undefined;

        try {
          const lat = dadosVoo.bbox.lat_centro;
          const lng = dadosVoo.bbox.lng_centro;
          // OpenStreetMap Nominatim (Gratuito, limite de 1 req/s)
          const geocodeRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`, {
            headers: {
              "User-Agent": "PraxisDrone/1.0"
            }
          });
          if (geocodeRes.ok) {
            const geodata = await geocodeRes.json();
            municipio = geodata.address?.city || geodata.address?.town || geodata.address?.village || geodata.address?.municipality;
            // Pega o estado (ou sigla se vier no ISO3166-2-lvl4)
            const estadoCompleto = geodata.address?.state;
            const isoState = geodata.address?.["ISO3166-2-lvl4"];
            uf = isoState ? isoState.split("-").pop() : estadoCompleto;
          }
        } catch (err) {
          console.warn("[Upload] Falha ao geocodificar localização:", err);
        }

        await supabase
          .from("projetos")
          .update({
            latitude: dadosVoo.bbox.lat_centro,
            longitude: dadosVoo.bbox.lng_centro,
            area_mapeada: dadosVoo.area_ha,
            drone: dadosVoo.drone_modelo,
            camera: dadosVoo.camera_modelo,
            bbox_geojson: {
              type: "Polygon",
              coordinates: [[
                [dadosVoo.bbox.oeste, dadosVoo.bbox.norte],
                [dadosVoo.bbox.leste, dadosVoo.bbox.norte],
                [dadosVoo.bbox.leste, dadosVoo.bbox.sul],
                [dadosVoo.bbox.oeste, dadosVoo.bbox.sul],
                [dadosVoo.bbox.oeste, dadosVoo.bbox.norte]
              ]]
            },
            ...(municipio ? { municipio } : {}),
            ...(uf ? { uf } : {}),
          })
          .eq("id", projetoId);
      }
    }
  } catch (err) {
    console.warn("[Upload] Falha ao calcular bbox do voo:", err);
  }

  // ─────────────────────────────────────────────────────────
  // FASE 5: ATUALIZAR STATUS E INICIAR PIPELINE
  // ─────────────────────────────────────────────────────────
  await atualizarStatusProjeto(projetoId, "Fotos recebidas");

  onProgress?.({
    percentual: 100,
    enviados: arquivos.length,
    total: arquivos.length,
    arquivoAtual: "Upload concluído!",
    fase: "concluido",
  });

  // Pipeline em background (não bloqueia o retorno)
  fetch("/api/pipeline/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projetoId })
  }).catch((e) => {
    console.error("[Upload] Erro ao despachar missão para a esteira:", e);
  });

  return {
    totalEnviadas: registros.length,
    totalComGPS: dadosVoo?.qtd_fotos_com_gps ?? 0,
    dadosVoo,
  };
}