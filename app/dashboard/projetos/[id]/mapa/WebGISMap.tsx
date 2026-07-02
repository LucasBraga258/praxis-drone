"use client";

import { MapContainer, TileLayer, Polygon, Popup, ImageOverlay } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix for leaflet icons in Next.js
import L from "leaflet";
const iconRetinaUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png";
const iconUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png";
const shadowUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export default function WebGISMap({ 
  bounds, 
  polygon, 
  mapMode, 
  layerType, 
  projeto, 
  initialCenter, 
  mapZoom 
}: { 
  bounds: any; 
  polygon: any; 
  mapMode: string; 
  layerType: string; 
  projeto: any;
  initialCenter: any;
  mapZoom: number;
}) {
  const fixTiTiler = (url: string | null | undefined) => {
    if (!url) return "";
    return url.replace("stac.cogeo.org", "titiler.xyz/stac");
  };

  return (
    <MapContainer 
      bounds={bounds && bounds.length > 0 ? bounds : undefined}
      center={(!bounds || bounds.length === 0) ? initialCenter : undefined}
      zoom={mapZoom || 5} 
      scrollWheelZoom={true} 
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />

      {polygon && polygon.length > 0 && (
        <Polygon pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1, weight: 3 }} positions={polygon}>
          <Popup>Área do Talhão</Popup>
        </Polygon>
      )}

      {/* Renderização do Satélite via TiTiler */}
      {mapMode === "satellite" && layerType === "rgb" && (projeto?.falsa_cor_img_url || projeto?.ortomosaico_img_url) && (
        <TileLayer
          key="sat-rgb"
          url={fixTiTiler(projeto.falsa_cor_img_url || projeto.ortomosaico_img_url)}
          attribution="&copy; Sentinel / TiTiler"
          maxNativeZoom={16}
        />
      )}

      {mapMode === "satellite" && layerType === "ndvi" && projeto?.ndvi_img_url && (
        <TileLayer
          key="sat-ndvi"
          url={fixTiTiler(projeto.ndvi_img_url)}
          attribution="&copy; Sentinel / TiTiler"
          maxNativeZoom={16}
        />
      )}

      {mapMode === "satellite" && layerType === "vari" && projeto?.vari_img_url && (
        <TileLayer
          key="sat-vari"
          url={fixTiTiler(projeto.vari_img_url)}
          attribution="&copy; Sentinel / TiTiler"
          maxNativeZoom={16}
        />
      )}

      {/* Renderização do Drone (Overlays Estáticos) */}
      {mapMode === "drone" && layerType === "rgb" && projeto?.ortomosaico_img_url && bounds && bounds.length > 0 && (
        <ImageOverlay
          url={projeto.ortomosaico_img_url}
          bounds={bounds}
          opacity={1.0}
        />
      )}

      {mapMode === "drone" && layerType === "ndvi" && projeto?.ndvi_img_url && bounds && bounds.length > 0 && (
        <ImageOverlay
          url={projeto.ndvi_img_url}
          bounds={bounds}
          opacity={1.0}
        />
      )}

    </MapContainer>
  );
}
