"use client";

/**
 * MissionFlightMap
 *
 * Wrapper client-side para o FlightMap.
 * Busca as coordenadas das fotos do Supabase e escuta
 * atualizações em tempo real via Realtime.
 */

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FotoMarcador, BboxVoo } from "@/app/components/FlightMap";

const FlightMap = dynamic(() => import("@/app/components/FlightMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 500,
        background: "#0b1828",
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div style={{ textAlign: "center", color: "#475569" }}>
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid #22c55e",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 12px",
          }}
        />
        <div style={{ fontSize: 13 }}>Carregando mapa...</div>
      </div>
    </div>
  ),
});

interface MissionFlightMapProps {
  projetoId: number;
  ortomosaicoUrl?: string | null;
  ndviUrl?: string | null;
  bbox?: BboxVoo | null;
  area_ha?: number;
}

export default function MissionFlightMap({
  projetoId,
  ortomosaicoUrl: ortomosaicoUrlProp,
  ndviUrl: ndviUrlProp,
  bbox: bboxProp,
  area_ha: area_haProp = 0,
}: MissionFlightMapProps) {
  const supabase = createClient();
  const [fotos, setFotos] = useState<FotoMarcador[]>([]);
  const [bbox, setBbox] = useState<BboxVoo | null>(bboxProp ?? null);
  const [area_ha, setAreaHa] = useState(area_haProp);
  const [distancia_km, setDistanciaKm] = useState(0);
  const [ortomosaicoUrl, setOrtomosaicoUrl] = useState(ortomosaicoUrlProp ?? null);
  const [ndviUrl, setNdviUrl] = useState(ndviUrlProp ?? null);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = useCallback(async () => {
    // Fotos com GPS (campo metadata)
    const { data: arquivos } = await supabase
      .from("arquivos_projeto")
      .select("nome, metadata, tamanho")
      .eq("projeto_id", projetoId)
      .eq("tipo", "foto");

    if (arquivos && arquivos.length > 0) {
      const fotasComGPS: FotoMarcador[] = [];

      for (const arq of arquivos) {
        const m = arq.metadata as any;
        if (m?.latitude != null && m?.longitude != null) {
          fotasComGPS.push({
            lat: m.latitude,
            lng: m.longitude,
            altitude: m.altitude,
            heading: m.heading,
            timestamp: m.timestamp,
            nome_arquivo: arq.nome,
            drone_modelo: m.drone_modelo,
            camera_modelo: m.camera_modelo,
          });
        }
      }

      setFotos(fotasComGPS);

      // Calcular bbox das fotos
      if (fotasComGPS.length > 0) {
        const lats = fotasComGPS.map((f) => f.lat);
        const lngs = fotasComGPS.map((f) => f.lng);
        const norte = Math.max(...lats);
        const sul = Math.min(...lats);
        const leste = Math.max(...lngs);
        const oeste = Math.min(...lngs);
        setBbox({
          norte,
          sul,
          leste,
          oeste,
          lat_centro: (norte + sul) / 2,
          lng_centro: (leste + oeste) / 2,
        });
      }
    }

    // Dados do projeto (bbox e urls)
    const { data: projeto } = await supabase
      .from("projetos")
      .select("latitude, longitude, area_mapeada, ortomosaico_img_url, ndvi_img_url")
      .eq("id", projetoId)
      .single();

    if (projeto) {
      if (projeto.area_mapeada) setAreaHa(projeto.area_mapeada);
      if (projeto.ortomosaico_img_url) setOrtomosaicoUrl(projeto.ortomosaico_img_url);
      if (projeto.ndvi_img_url) setNdviUrl(projeto.ndvi_img_url);
    }

    setCarregando(false);
  }, [projetoId]);

  useEffect(() => {
    carregarDados();

    // Realtime: escutar novos arquivos
    const channel = supabase
      .channel(`flight-map-${projetoId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "arquivos_projeto",
          filter: `projeto_id=eq.${projetoId}`,
        },
        () => {
          carregarDados();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "projetos",
          filter: `id=eq.${projetoId}`,
        },
        (payload) => {
          const proj = payload.new as any;
          if (proj.ortomosaico_img_url) setOrtomosaicoUrl(proj.ortomosaico_img_url);
          if (proj.ndvi_img_url) setNdviUrl(proj.ndvi_img_url);
          if (proj.area_mapeada) setAreaHa(proj.area_mapeada);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projetoId, carregarDados]);

  if (carregando) {
    return (
      <div
        style={{
          height: 500,
          background: "#0b1828",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ textAlign: "center", color: "#475569" }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid #22c55e",
              borderTopColor: "transparent",
              borderRadius: "50%",
              margin: "0 auto 12px",
            }}
            className="animate-spin"
          />
          <div style={{ fontSize: 13 }}>Carregando dados do voo...</div>
        </div>
      </div>
    );
  }

  return (
    <FlightMap
      fotos={fotos}
      bbox={bbox}
      area_ha={area_ha}
      distancia_km={distancia_km}
      ortomosaicoUrl={ortomosaicoUrl}
      ndviUrl={ndviUrl}
      altura="520px"
    />
  );
}
