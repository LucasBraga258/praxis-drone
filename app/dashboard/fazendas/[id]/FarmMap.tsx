"use client";

/**
 * FarmMap — Mapa Geral da Fazenda
 *
 * Exibe todos os talhões da fazenda sobre imagem de satélite.
 * Centraliza automaticamente na fazenda.
 * Clicar em um talhão navega para a página do talhão.
 *
 * Carregado via dynamic import com ssr: false.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  ScaleControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

export interface TalhaoMarcador {
  id: number;
  nome: string;
  cultura?: string | null;
  area?: number | null;
  lat?: number | null;
  lng?: number | null;
}

interface FarmMapProps {
  fazendaNome: string;
  fazendaId: number;
  talhoes: TalhaoMarcador[];
  latCenter?: number | null;
  lngCenter?: number | null;
  altura?: string;
}

/** Cria um ícone de talhão estilizado */
function talhaoIcon(nome: string) {
  const initials = nome.slice(0, 2).toUpperCase();
  return new L.DivIcon({
    html: `<div style="
      background: linear-gradient(135deg,#22c55e,#16a34a);
      color:#fff;
      border:2px solid #fff;
      border-radius:8px;
      width:36px;height:36px;
      display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:700;
      box-shadow:0 4px 12px rgba(0,0,0,0.4);
      cursor:pointer;
    ">${initials}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    className: "",
  });
}

function AutoCenter({
  lat,
  lng,
  talhoes,
}: {
  lat?: number | null;
  lng?: number | null;
  talhoes: TalhaoMarcador[];
}) {
  const map = useMap();

  useEffect(() => {
    const talhoesComCoords = talhoes.filter((t) => t.lat && t.lng);
    if (lat && lng) {
      map.setView([lat, lng], 14);
    } else if (talhoesComCoords.length > 0) {
      const lats = talhoesComCoords.map((t) => t.lat!);
      const lngs = talhoesComCoords.map((t) => t.lng!);
      map.fitBounds(
        [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ],
        { padding: [60, 60], maxZoom: 16 }
      );
    }
  }, [lat, lng, talhoes, map]);

  return null;
}

export default function FarmMap({
  fazendaNome,
  fazendaId,
  talhoes,
  latCenter,
  lngCenter,
  altura = "420px",
}: FarmMapProps) {
  const router = useRouter();

  const talhoesComCoords = talhoes.filter((t) => t.lat && t.lng);
  const centroInicial: [number, number] =
    latCenter && lngCenter
      ? [latCenter, lngCenter]
      : [-14.235, -51.925];

  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}>
      {/* Info pill */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 500,
          background: "rgba(6,15,27,0.92)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          padding: "10px 14px",
          pointerEvents: "none",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 13, color: "#f1f5f9", marginBottom: 4 }}>
          🌾 {fazendaNome}
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8" }}>
          {talhoes.length} talhão{talhoes.length !== 1 ? "s" : ""}
          {talhoesComCoords.length > 0 && ` · ${talhoesComCoords.length} no mapa`}
        </div>
      </div>

      <MapContainer
        center={centroInicial}
        zoom={latCenter && lngCenter ? 14 : 5}
        style={{ height: altura, width: "100%" }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" imperial={false} />

        <AutoCenter lat={latCenter} lng={lngCenter} talhoes={talhoes} />

        {/* Satélite */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="© Esri"
          maxZoom={20}
        />

        {/* Marcadores de talhões */}
        {talhoesComCoords.map((talhao) => (
          <Marker
            key={talhao.id}
            position={[talhao.lat!, talhao.lng!]}
            icon={talhaoIcon(talhao.nome)}
            eventHandlers={{
              click: () => router.push(`/dashboard/talhoes/${talhao.id}`),
            }}
          >
            <Popup>
              <div style={{ minWidth: 140, fontSize: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{talhao.nome}</div>
                {talhao.cultura && <div>🌱 {talhao.cultura}</div>}
                {talhao.area && <div>📐 {talhao.area} ha</div>}
                <button
                  onClick={() => router.push(`/dashboard/talhoes/${talhao.id}`)}
                  style={{
                    marginTop: 8,
                    width: "100%",
                    padding: "4px 0",
                    background: "#22c55e",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  Abrir Talhão →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Sem coordenadas: mensagem no canto */}
        {talhoesComCoords.length === 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 500,
              background: "rgba(6,15,27,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "8px 16px",
              fontSize: 12,
              color: "#94a3b8",
              pointerEvents: "none",
            }}
          >
            📍 Talhões sem coordenadas GPS cadastradas
          </div>
        )}
      </MapContainer>
    </div>
  );
}
