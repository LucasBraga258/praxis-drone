"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useMapEvents, MapContainer, TileLayer, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons
import L from "leaflet";
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface SplitMapProps {
  bbox: { lat_centro: number; lng_centro: number; coordinates: number[][][] } | null;
  esquerda: any; // MonitoramentoMarcador
  direita: any; // MonitoramentoMarcador
}

function SyncMap({ 
  center, 
  zoom, 
  onMove 
}: { 
  center: [number, number], 
  zoom: number, 
  onMove: (c: [number, number], z: number) => void 
}) {
  const map = useMapEvents({
    moveend: () => {
      onMove([map.getCenter().lat, map.getCenter().lng], map.getZoom());
    }
  });

  useEffect(() => {
    map.setView(center, zoom, { animate: false });
  }, [center, zoom, map]);

  return null;
}

export default function SplitMap({ bbox, esquerda, direita }: SplitMapProps) {
  const defaultCenter: [number, number] = bbox ? [bbox.lat_centro, bbox.lng_centro] : [-15.793889, -47.882778];
  
  const [viewState, setViewState] = useState({
    center: defaultCenter,
    zoom: 15
  });

  const [activeMap, setActiveMap] = useState<"left" | "right" | null>(null);
  const [sliderPos, setSliderPos] = useState(50); // 0 a 100%

  const [esquerdaLayer, setEsquerdaLayer] = useState<"ndvi" | "orto" | "vari" | "falsaCor">("ndvi");
  const [direitaLayer, setDireitaLayer] = useState<"ndvi" | "orto" | "vari" | "falsaCor">("ndvi");

  const getUrl = (mon: any, type: string) => {
    switch (type) {
      case "ndvi": return mon?.ndviImgUrl;
      case "vari": return mon?.variImgUrl;
      case "falsaCor": return mon?.falsaCorImgUrl;
      case "orto": return mon?.ortomosaicoImgUrl;
      default: return null;
    }
  };

  const handleMove = (source: "left" | "right", c: [number, number], z: number) => {
    if (activeMap !== source) return; // Só atualiza se foi interagido pelo respectivo mapa
    setViewState({ center: c, zoom: z });
  };

  const esqUrl = getUrl(esquerda, esquerdaLayer) || esquerda?.ndviImgUrl || esquerda?.ortomosaicoImgUrl || "";
  const dirUrl = getUrl(direita, direitaLayer) || direita?.ndviImgUrl || direita?.ortomosaicoImgUrl || "";

  return (
    <div style={{ position: "relative", width: "100%", height: "450px", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--bg-border)" }}>
      {/* Container Esquerda */}
      <div 
        style={{ position: "absolute", top: 0, left: 0, width: `${sliderPos}%`, height: "100%", zIndex: 1 }}
        onMouseEnter={() => setActiveMap("left")}
      >
        <MapContainer center={viewState.center} zoom={viewState.zoom} style={{ width: "100vw", height: "100%" }} zoomControl={false}>
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" maxZoom={20} />
          {esqUrl && <TileLayer url={esqUrl.replace("https://stac.cogeo.org/", "https://stac.cogeo.org/")} maxZoom={22} />}
          {bbox?.coordinates && (
            <Polygon positions={bbox.coordinates[0].map(c => [c[1], c[0]])} pathOptions={{ color: "yellow", fillOpacity: 0.1 }} />
          )}
          <SyncMap center={viewState.center} zoom={viewState.zoom} onMove={(c, z) => handleMove("left", c, z)} />
        </MapContainer>
        
        {/* Layer Selector Esquerda */}
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000, background: "rgba(0,0,0,0.8)", padding: "8px", borderRadius: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ color: "#fff", fontSize: 11, fontWeight: "bold", marginBottom: 2 }}>MISSÃO ANTERIOR</div>
          <select 
            value={esquerdaLayer} 
            onChange={e => setEsquerdaLayer(e.target.value as any)}
            style={{ background: "#333", color: "#fff", border: "1px solid #555", borderRadius: 4, padding: "2px 4px", fontSize: 12 }}
          >
            {esquerda?.ndviImgUrl && <option value="ndvi">NDVI</option>}
            {esquerda?.variImgUrl && <option value="vari">VARI</option>}
            {esquerda?.falsaCorImgUrl && <option value="falsaCor">Falsa Cor</option>}
            {esquerda?.ortomosaicoImgUrl && <option value="orto">Ortomosaico</option>}
          </select>
        </div>
      </div>

      {/* Container Direita */}
      <div 
        style={{ position: "absolute", top: 0, right: 0, width: `${100 - sliderPos}%`, height: "100%", zIndex: 1 }}
        onMouseEnter={() => setActiveMap("right")}
      >
        <div style={{ position: "absolute", right: 0, top: 0, width: "100vw", height: "100%", transform: `translateX(${sliderPos}vw)` }}>
          <MapContainer center={viewState.center} zoom={viewState.zoom} style={{ width: "100%", height: "100%" }} zoomControl={false}>
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" maxZoom={20} />
            {dirUrl && <TileLayer url={dirUrl.replace("https://stac.cogeo.org/", "https://stac.cogeo.org/")} maxZoom={22} />}
            {bbox?.coordinates && (
              <Polygon positions={bbox.coordinates[0].map(c => [c[1], c[0]])} pathOptions={{ color: "#22c55e", fillOpacity: 0.1 }} />
            )}
            <SyncMap center={viewState.center} zoom={viewState.zoom} onMove={(c, z) => handleMove("right", c, z)} />
          </MapContainer>
        </div>

        {/* Layer Selector Direita */}
        <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000, background: "rgba(0,0,0,0.8)", padding: "8px", borderRadius: 8, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
          <div style={{ color: "#fff", fontSize: 11, fontWeight: "bold", marginBottom: 2 }}>MISSÃO ATUAL</div>
          <select 
            value={direitaLayer} 
            onChange={e => setDireitaLayer(e.target.value as any)}
            style={{ background: "#333", color: "#fff", border: "1px solid #555", borderRadius: 4, padding: "2px 4px", fontSize: 12 }}
          >
            {direita?.ndviImgUrl && <option value="ndvi">NDVI</option>}
            {direita?.variImgUrl && <option value="vari">VARI</option>}
            {direita?.falsaCorImgUrl && <option value="falsaCor">Falsa Cor</option>}
            {direita?.ortomosaicoImgUrl && <option value="orto">Ortomosaico</option>}
          </select>
        </div>
      </div>

      {/* Slider Control */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPos}
        onChange={(e) => setSliderPos(Number(e.target.value))}
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          width: "100%",
          zIndex: 10,
          cursor: "ew-resize",
          opacity: 0.7,
        }}
      />
    </div>
  );
}
