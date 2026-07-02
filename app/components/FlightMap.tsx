"use client";

/**
 * FlightMap — Mapa de Voo Imediato
 *
 * Exibe o mapa ANTES do ortomosaico existir, usando apenas as coordenadas GPS do EXIF.
 * Quando o ortomosaico estiver disponível, substitui automaticamente a camada de satélite.
 *
 * Inspirado no DroneDeploy / Pix4D.
 * Carregado sempre via dynamic import com ssr: false.
 */

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Rectangle,
  Popup,
  LayersControl,
  ImageOverlay,
  useMap,
  ZoomControl,
  ScaleControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons no Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

export interface FotoMarcador {
  lat: number;
  lng: number;
  altitude?: number | null;
  heading?: number | null;
  timestamp?: string | null;
  nome_arquivo?: string;
  drone_modelo?: string | null;
  camera_modelo?: string | null;
}

export interface BboxVoo {
  norte: number;
  sul: number;
  leste: number;
  oeste: number;
  lat_centro: number;
  lng_centro: number;
}

interface FlightMapProps {
  fotos: FotoMarcador[];
  bbox?: BboxVoo | null;
  area_ha?: number;
  distancia_km?: number;
  ortomosaicoUrl?: string | null;
  ndviUrl?: string | null;
  variUrl?: string | null;
  falsaCorUrl?: string | null;
  altura?: string | number;
}

/** Componente interno para fazer zoom automático no bbox */
function AutoFitBounds({
  bbox,
  fotos,
}: {
  bbox?: BboxVoo | null;
  fotos: FotoMarcador[];
}) {
  const map = useMap();

  useEffect(() => {
    if (bbox) {
      map.fitBounds(
        [
          [bbox.sul, bbox.oeste],
          [bbox.norte, bbox.leste],
        ],
        { padding: [40, 40], maxZoom: 18 }
      );
    } else if (fotos.length > 0) {
      const lats = fotos.map((f) => f.lat);
      const lngs = fotos.map((f) => f.lng);
      map.fitBounds(
        [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ],
        { padding: [40, 40], maxZoom: 18 }
      );
    }
  }, [bbox, fotos, map]);

  return null;
}

/** Ícone pequeno de foto (câmera) */
const fotoIcon = new L.DivIcon({
  html: `<div style="
    width:10px;height:10px;
    background:#22c55e;
    border:2px solid #fff;
    border-radius:50%;
    box-shadow:0 0 4px rgba(0,0,0,0.6);
  "></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
  className: "",
});

/** Ícone de primeira/última foto */
const marcadorIcon = (cor: string) =>
  new L.DivIcon({
    html: `<div style="
      width:16px;height:16px;
      background:${cor};
      border:3px solid #fff;
      border-radius:50%;
      box-shadow:0 2px 8px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    className: "",
  });

export default function FlightMap({
  fotos,
  bbox,
  area_ha = 0,
  distancia_km = 0,
  ortomosaicoUrl,
  ndviUrl,
  variUrl,
  falsaCorUrl,
  altura = "500px",
}: FlightMapProps) {
  const fotosComGPS = useMemo(
    () => fotos.filter((f) => f.lat && f.lng),
    [fotos]
  );

  const rota = useMemo(
    () => fotosComGPS.map((f) => [f.lat, f.lng] as [number, number]),
    [fotosComGPS]
  );

  const bboxBounds = useMemo((): L.LatLngBoundsExpression | undefined => {
    if (!bbox) return undefined;
    return [
      [bbox.sul, bbox.oeste],
      [bbox.norte, bbox.leste],
    ];
  }, [bbox]);

  const ortoBounds = useMemo((): L.LatLngBoundsExpression | undefined => {
    if (!bbox) return undefined;
    return [
      [bbox.sul, bbox.oeste],
      [bbox.norte, bbox.leste],
    ];
  }, [bbox]);

  // Centro inicial — Brasil se não houver dados
  const centroInicial: [number, number] =
    bbox
      ? [bbox.lat_centro, bbox.lng_centro]
      : fotosComGPS.length > 0
      ? [fotosComGPS[0].lat, fotosComGPS[0].lng]
      : [-14.235, -51.925];

  const temDados = fotosComGPS.length > 0;
  const temOrtomosaico = !!ortomosaicoUrl;
  const isSatellite = !temOrtomosaico && !temDados && (!!ndviUrl || !!variUrl || !!falsaCorUrl);

  const fixTiTiler = (url: string | null | undefined) => {
    if (!url) return "";
    return url.replace("stac.cogeo.org", "titiler.xyz/stac");
  };

  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}>
      {/* ── Painel de Informações ── */}
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
          padding: "12px 16px",
          minWidth: 200,
          pointerEvents: "none",
        }}
      >
        {!temDados ? (
          <div style={{ color: "#94a3b8", fontSize: 12 }}>
            <div style={{ fontWeight: 600, color: "#f1f5f9", marginBottom: 4 }}>
              🛰️ Aguardando dados GPS
            </div>
            <div>Faça o upload das fotos para</div>
            <div>visualizar o mapa do voo.</div>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            <div
              style={{
                fontWeight: 700,
                color: "#4ade80",
                fontSize: 13,
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: temOrtomosaico ? "#22c55e" : "#f59e0b",
                  display: "inline-block",
                  boxShadow: `0 0 6px ${temOrtomosaico ? "#22c55e" : "#f59e0b"}`,
                  flexShrink: 0,
                }}
              />
              {temOrtomosaico ? "Produto Disponível" : (isSatellite ? "Satélite Disponível" : "Mapa de Satélite")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {!isSatellite && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span>📷 Fotos com GPS</span>
                  <span style={{ color: "#f1f5f9", fontWeight: 600 }}>
                    {fotosComGPS.length}
                  </span>
                </div>
              )}
              {area_ha > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span>📐 Área estimada</span>
                  <span style={{ color: "#f1f5f9", fontWeight: 600 }}>
                    {area_ha.toFixed(1)} ha
                  </span>
                </div>
              )}
              {distancia_km > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span>📏 Distância voada</span>
                  <span style={{ color: "#f1f5f9", fontWeight: 600 }}>
                    {distancia_km.toFixed(1)} km
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Mapa ── */}
      <MapContainer
        center={centroInicial}
        zoom={temDados || isSatellite ? 15 : 4}
        style={{ height: altura, width: "100%" }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" imperial={false} />

        {(temDados || bboxBounds) && <AutoFitBounds bbox={bbox} fotos={fotosComGPS} />}

        <LayersControl position="topright" collapsed={false}>
          {/* Camada base: Satélite */}
          <LayersControl.BaseLayer
            checked={!temOrtomosaico}
            name="🛰️ Satélite"
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="© Esri"
              maxZoom={20}
            />
          </LayersControl.BaseLayer>

          {/* Ortomosaico BaseLayer (se Tile) */}
          {temOrtomosaico && ortomosaicoUrl!.includes("{z}") && (
            <LayersControl.BaseLayer checked name="🗺️ Ortomosaico">
              <TileLayer
                url={fixTiTiler(ortomosaicoUrl)}
                maxZoom={20}
                maxNativeZoom={16}
              />
            </LayersControl.BaseLayer>
          )}

          {/* Overlay: NDVI */}
          {ndviUrl && (
            <LayersControl.Overlay name="🟢 NDVI" checked={!temOrtomosaico}>
              {ndviUrl.includes("{z}") ? (
                <TileLayer url={fixTiTiler(ndviUrl)} maxZoom={20} opacity={0.85} maxNativeZoom={16} />
              ) : (
                ortoBounds ? <ImageOverlay url={ndviUrl} bounds={ortoBounds} opacity={0.85} /> : null
              )}
            </LayersControl.Overlay>
          )}

          {/* Overlay: VARI */}
          {variUrl && (
            <LayersControl.Overlay name="🟡 VARI">
              {variUrl.includes("{z}") ? (
                <TileLayer url={fixTiTiler(variUrl)} maxZoom={20} opacity={0.85} maxNativeZoom={16} />
              ) : (
                ortoBounds ? <ImageOverlay url={variUrl} bounds={ortoBounds} opacity={0.85} /> : null
              )}
            </LayersControl.Overlay>
          )}

          {/* Overlay: Falsa Cor */}
          {falsaCorUrl && (
            <LayersControl.Overlay name="🔴 Falsa Cor (Satélite)" checked={isSatellite}>
              {falsaCorUrl.includes("{z}") ? (
                <TileLayer url={fixTiTiler(falsaCorUrl)} maxZoom={20} opacity={1} maxNativeZoom={16} />
              ) : (
                ortoBounds ? <ImageOverlay url={falsaCorUrl} bounds={ortoBounds} opacity={1} /> : null
              )}
            </LayersControl.Overlay>
          )}

          {/* Overlay: Ortomosaico como camada */}
          {temOrtomosaico && ortoBounds && !ortomosaicoUrl!.includes("{z}") && (
            <LayersControl.Overlay checked name="🖼️ Ortomosaico (overlay)">
              <ImageOverlay
                url={ortomosaicoUrl!}
                bounds={ortoBounds}
                opacity={0.9}
              />
            </LayersControl.Overlay>
          )}

          {/* Overlay: Linha de voo */}
          {rota.length >= 2 && (
            <LayersControl.Overlay checked name="✈️ Linha de voo">
              <Polyline
                positions={rota}
                pathOptions={{
                  color: "#f59e0b",
                  weight: 2,
                  opacity: 0.8,
                  dashArray: "4 6",
                }}
              />
            </LayersControl.Overlay>
          )}

          {/* Overlay: Fotos */}
          {fotosComGPS.length > 0 && (
            <LayersControl.Overlay checked name="📷 Fotos">
              <>
                {fotosComGPS.map((foto, i) => (
                  <Marker
                    key={`${foto.nome_arquivo ?? i}`}
                    position={[foto.lat, foto.lng]}
                    icon={
                      i === 0
                        ? marcadorIcon("#22c55e")
                        : i === fotosComGPS.length - 1
                        ? marcadorIcon("#ef4444")
                        : fotoIcon
                    }
                  >
                    <Popup>
                      <div style={{ fontSize: 12, minWidth: 160 }}>
                        <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>
                          {foto.nome_arquivo ?? `Foto ${i + 1}`}
                        </div>
                        {foto.drone_modelo && (
                          <div>🚁 {foto.drone_modelo}</div>
                        )}
                        {foto.camera_modelo && (
                          <div>📷 {foto.camera_modelo}</div>
                        )}
                        <div>📍 {foto.lat.toFixed(6)}, {foto.lng.toFixed(6)}</div>
                        {foto.altitude != null && (
                          <div>⬆️ {foto.altitude.toFixed(1)} m</div>
                        )}
                        {foto.heading != null && (
                          <div>🧭 {foto.heading.toFixed(0)}°</div>
                        )}
                        {foto.timestamp && (
                          <div style={{ marginTop: 4, color: "#888" }}>
                            {new Date(foto.timestamp).toLocaleString("pt-BR")}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </>
            </LayersControl.Overlay>
          )}

          {/* Overlay: Bounding Box */}
          {bboxBounds && (
            <LayersControl.Overlay checked name="⬜ Área do voo">
              <Rectangle
                bounds={bboxBounds}
                pathOptions={{
                  color: "#4ade80",
                  fillColor: "#22c55e",
                  fillOpacity: 0.06,
                  weight: 2,
                  dashArray: "6 4",
                }}
              />
            </LayersControl.Overlay>
          )}
        </LayersControl>
      </MapContainer>
    </div>
  );
}
