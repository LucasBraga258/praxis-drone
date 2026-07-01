"use client";

/**
 * TalhaoMap — Mapa do Talhão com Histórico de Monitoramentos
 *
 * Exibe todos os monitoramentos deste talhão sobre satélite.
 * Cada marcador é um monitoramento com informações ao clicar.
 */

import { useEffect, useState } from "react";
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

export interface MonitoramentoMarcador {
  id: number;
  codigo: string;
  data_voo: string;
  status?: string;
  ortomosaicoImgUrl?: string | null;
  ndviImgUrl?: string | null;
  lat: number;
  lng: number;
}

interface TalhaoMapProps {
  talhaoId: number;
  talhaoNome: string;
  monitoramentos: MonitoramentoMarcador[];
  altura?: string;
}

function monitoramentoIcon(status?: string, index?: number) {
  const corFundo = status === "Concluído" ? "#22c55e" : status === "Erro" ? "#ef4444" : "#f59e0b";
  const numero = (index ?? 0) + 1;

  return new L.DivIcon({
    html: `<div style="
      background:${corFundo};
      color:#fff;
      border:2.5px solid #fff;
      border-radius:50%;
      width:28px;height:28px;
      display:flex;align-items:center;justify-content:center;
      font-size:10px;font-weight:800;
      box-shadow:0 3px 10px rgba(0,0,0,0.45);
      cursor:pointer;
    ">${numero}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    className: "",
  });
}

function AutoCenter({ monitoramentos }: { monitoramentos: MonitoramentoMarcador[] }) {
  const map = useMap();

  useEffect(() => {
    if (monitoramentos.length === 0) return;

    const lats = monitoramentos.map((m) => m.lat);
    const lngs = monitoramentos.map((m) => m.lng);

    if (monitoramentos.length === 1) {
      map.setView([lats[0], lngs[0]], 16);
    } else {
      map.fitBounds(
        [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ],
        { padding: [60, 60], maxZoom: 17 }
      );
    }
  }, [monitoramentos, map]);

  return null;
}

export default function TalhaoMap({
  talhaoId,
  talhaoNome,
  monitoramentos,
  altura = "380px",
}: TalhaoMapProps) {
  const router = useRouter();
  const temMonitoramentos = monitoramentos.length > 0;
  const centroInicial: [number, number] =
    temMonitoramentos
      ? [monitoramentos[0].lat, monitoramentos[0].lng]
      : [-14.235, -51.925];

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--bg-border)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        position: "relative",
      }}
    >
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
          🌱 {talhaoNome}
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8" }}>
          {monitoramentos.length > 0
            ? `${monitoramentos.length} monitoramento${monitoramentos.length !== 1 ? "s" : ""} no mapa`
            : "Sem coordenadas GPS cadastradas"}
        </div>
      </div>

      {!temMonitoramentos && (
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
            whiteSpace: "nowrap",
          }}
        >
          📍 Faça upload de fotos com GPS para visualizar os monitoramentos no mapa
        </div>
      )}

      <MapContainer
        center={centroInicial}
        zoom={temMonitoramentos ? 15 : 5}
        style={{ height: altura, width: "100%" }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" imperial={false} />

        <AutoCenter monitoramentos={monitoramentos} />

        {/* Satélite */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="© Esri"
          maxZoom={20}
        />

        {/* Marcadores de monitoramentos */}
        {monitoramentos.map((m, index) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={monitoramentoIcon(m.status, index)}
            eventHandlers={{
              click: () => router.push(`/dashboard/projetos/${m.id}`),
            }}
          >
            <Popup>
              <div style={{ minWidth: 160, fontSize: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>
                  {m.codigo || `Monitoramento #${m.id}`}
                </div>
                <div style={{ marginBottom: 4, color: "#666" }}>📅 {m.data_voo}</div>
                {m.status && (
                  <div style={{ marginBottom: 8, color: m.status === "Concluído" ? "#22c55e" : "#f59e0b" }}>
                    ● {m.status}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6 }}>
                  {m.ortomosaicoImgUrl && (
                    <button
                      onClick={() => router.push(`/dashboard/projetos/${m.id}/mapa`)}
                      style={{ flex: 1, padding: "4px 0", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 600 }}
                    >
                      🗺️ WebGIS
                    </button>
                  )}
                  <button
                    onClick={() => router.push(`/dashboard/projetos/${m.id}`)}
                    style={{ flex: 1, padding: "4px 0", background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 600 }}
                  >
                    Ver →
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
