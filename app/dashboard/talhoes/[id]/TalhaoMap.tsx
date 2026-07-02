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
  LayersControl,
  FeatureGroup
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
  variImgUrl?: string | null;
  falsaCorImgUrl?: string | null;
  dsmImgUrl?: string | null;
  dtmImgUrl?: string | null;
  lat: number;
  lng: number;
}

interface TalhaoMapProps {
  talhaoId: number;
  talhaoNome: string;
  monitoramentos: MonitoramentoMarcador[];
  altura?: string;
  talhaoGeojson?: any;
  talhaoLat?: number | null;
  talhaoLng?: number | null;
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

function CustomGeoJSONLayer({ data, color, weight, fillOpacity, onClick }: { data: any, color: string, weight: number, fillOpacity: number, onClick?: () => void }) {
  const map = useMap();
  useEffect(() => {
    if (!data) return;
    try {
      const geojsonObj = typeof data === "string" ? JSON.parse(data) : data;
      const layer = L.geoJSON(geojsonObj, {
        style: { color, weight, opacity: 0.8, fillOpacity, dashArray: onClick ? undefined : "4 4" }
      }).addTo(map);

      if (onClick) {
        layer.on("click", onClick);
      }

      return () => { map.removeLayer(layer); };
    } catch (e) {
      console.error("Error drawing GeoJSON", e);
    }
  }, [data, map, color, weight, fillOpacity, onClick]);
  return null;
}

function AutoCenter({ monitoramentos, talhaoGeojson }: { monitoramentos: MonitoramentoMarcador[], talhaoGeojson?: any }) {
  const map = useMap();

  useEffect(() => {
    if (talhaoGeojson) {
      try {
        const geojsonObj = typeof talhaoGeojson === "string" ? JSON.parse(talhaoGeojson) : talhaoGeojson;
        const layer = L.geoJSON(geojsonObj);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17 });
          return;
        }
      } catch (e) {
        console.error("AutoCenter Error on GeoJSON:", e);
      }
    }

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
  }, [monitoramentos, map, talhaoGeojson]);

  return null;
}

export default function TalhaoMap({
  talhaoId,
  talhaoNome,
  monitoramentos,
  altura = "380px",
  talhaoGeojson,
  talhaoLat,
  talhaoLng,
}: TalhaoMapProps) {
  const router = useRouter();
  const temMonitoramentos = monitoramentos.length > 0;
  
  const centroInicial: [number, number] =
    temMonitoramentos
      ? [monitoramentos[0].lat, monitoramentos[0].lng]
      : talhaoLat && talhaoLng 
        ? [talhaoLat, talhaoLng] 
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
            : talhaoGeojson ? "Área demarcada no mapa" : "Sem coordenadas GPS cadastradas"}
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
        zoom={temMonitoramentos || (talhaoLat && talhaoLng) ? 15 : 5}
        style={{ height: altura, width: "100%" }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" imperial={false} />

        <AutoCenter monitoramentos={monitoramentos} talhaoGeojson={talhaoGeojson} />

        <LayersControl position="topright" collapsed={false}>
          {/* Base Maps */}
          <LayersControl.BaseLayer checked name="🌍 Satélite RGB">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="© Esri"
              maxZoom={20}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="🛣️ Mapa de Ruas">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap"
              maxZoom={20}
            />
          </LayersControl.BaseLayer>

          {/* Último Monitoramento Overlays */}
          {temMonitoramentos && monitoramentos[0].ndviImgUrl && (
            <LayersControl.Overlay name="🟢 Último NDVI">
              <TileLayer url={monitoramentos[0].ndviImgUrl.replace("https://stac.cogeo.org/", "https://stac.cogeo.org/")} maxZoom={20} opacity={0.85} maxNativeZoom={16} />
            </LayersControl.Overlay>
          )}
          
          {temMonitoramentos && monitoramentos[0].variImgUrl && (
            <LayersControl.Overlay name="🟡 Último VARI">
              <TileLayer url={monitoramentos[0].variImgUrl} maxZoom={20} opacity={0.85} maxNativeZoom={16} />
            </LayersControl.Overlay>
          )}

          {temMonitoramentos && monitoramentos[0].falsaCorImgUrl && (
            <LayersControl.Overlay name="🔴 Última Falsa Cor">
              <TileLayer url={monitoramentos[0].falsaCorImgUrl} maxZoom={20} opacity={1} maxNativeZoom={16} />
            </LayersControl.Overlay>
          )}

          {/* Overlays */}
          {talhaoGeojson && (
            <LayersControl.Overlay checked name="Polígono do Talhão">
              <FeatureGroup>
                <CustomGeoJSONLayer data={talhaoGeojson} color="#4ade80" weight={3} fillOpacity={0.05} />
              </FeatureGroup>
            </LayersControl.Overlay>
          )}

          {/* Dinamicamente adicionar o último NDVI/VARI se existir */}
          {temMonitoramentos && (() => {
            // Pegar as URLs do monitoramento mais recente (índice 0)
            const latest = monitoramentos[0];
            const renderLayer = (url: string) => {
              if (url.includes("{z}")) {
                const fixedUrl = url.replace("stac.cogeo.org", "titiler.xyz/stac");
                return <TileLayer url={fixedUrl} maxZoom={20} maxNativeZoom={16} />;
              }
              return null;
            };

            return (
              <>
                {latest.ndviImgUrl && latest.ndviImgUrl.includes("{z}") && (
                  <LayersControl.Overlay name="Último NDVI (Saúde)">
                    {renderLayer(latest.ndviImgUrl)}
                  </LayersControl.Overlay>
                )}
                {latest.variImgUrl && latest.variImgUrl.includes("{z}") && (
                  <LayersControl.Overlay name="Último VARI (Vigor)">
                    {renderLayer(latest.variImgUrl)}
                  </LayersControl.Overlay>
                )}
                {latest.falsaCorImgUrl && latest.falsaCorImgUrl.includes("{z}") && (
                  <LayersControl.Overlay checked name="Última Falsa Cor / RGB (Satélite)">
                    {renderLayer(latest.falsaCorImgUrl)}
                  </LayersControl.Overlay>
                )}
                {latest.ortomosaicoImgUrl && latest.ortomosaicoImgUrl.includes("{z}") && !latest.ortomosaicoImgUrl.includes("vari") && (
                  <LayersControl.Overlay name="Último Ortomosaico">
                    {renderLayer(latest.ortomosaicoImgUrl)}
                  </LayersControl.Overlay>
                )}
                {latest.dsmImgUrl && latest.dsmImgUrl.includes("{z}") && (
                  <LayersControl.Overlay name="Modelo de Superfície (DSM)">
                    {renderLayer(latest.dsmImgUrl)}
                  </LayersControl.Overlay>
                )}
                {latest.dtmImgUrl && latest.dtmImgUrl.includes("{z}") && (
                  <LayersControl.Overlay name="Modelo de Terreno (DTM)">
                    {renderLayer(latest.dtmImgUrl)}
                  </LayersControl.Overlay>
                )}
              </>
            );
          })()}
        </LayersControl>

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
