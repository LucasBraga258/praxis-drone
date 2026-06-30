"use client";

import { useState, useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import * as turf from "@turf/turf";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// Corrige problema clássico dos ícones do Leaflet no Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface UploadMapProps {
  onAreaCalculated: (areaHectares: number | null, geoJson: any) => void;
}

export default function UploadMap({ onAreaCalculated }: UploadMapProps) {
  const [areaTotal, setAreaTotal] = useState<number | null>(null);
  const featureGroupRef = useRef<any>(null);

  const handleCreated = (e: any) => {
    const layer = e.layer;
    
    // Extrai o GeoJSON do polígono desenhado
    const geoJson = layer.toGeoJSON();
    
    // Calcula a área em metros quadrados usando a engine avançada do Turf.js
    const areaSqMeters = turf.area(geoJson);
    
    // Converte para Hectares (1 Hectare = 10,000 m²)
    const areaHectares = areaSqMeters / 10000;
    
    setAreaTotal(areaHectares);
    onAreaCalculated(areaHectares, geoJson);
  };

  const handleDeleted = () => {
    setAreaTotal(null);
    onAreaCalculated(null, null);
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* HUD Superior estilo DroneDeploy */}
      <div className="bg-[#0F1C30] border border-slate-700 rounded-xl p-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            🗺️ Delimitação da Área de Interesse
          </h3>
          <p className="text-sm text-slate-400">
            Use a ferramenta de polígono (⬟) no mapa para recortar o quadrante exato do seu projeto.
          </p>
        </div>
        
        {areaTotal !== null && (
          <div className="bg-indigo-900/30 border border-indigo-500/50 px-4 py-2 rounded-lg text-right">
            <p className="text-xs text-indigo-300 uppercase font-bold">Área Selecionada</p>
            <p className="text-xl font-bold text-indigo-400">{areaTotal.toFixed(2)} ha</p>
          </div>
        )}
      </div>

      <div className="h-[450px] w-full rounded-xl overflow-hidden border-2 border-slate-700 relative z-0">
        <MapContainer 
          center={[-14.235, -51.925]} // Centro do Brasil (Ajuste depois se extrair do EXIF)
          zoom={4} 
          style={{ height: "100%", width: "100%", zIndex: 1 }}
        >
          {/* Camada Híbrida de Satélite (Padrão ouro para o Agro) */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          />
          
          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              position="topright"
              onCreated={handleCreated}
              onDeleted={handleDeleted}
              draw={{
                polyline: false,
                circle: false,
                circlemarker: false,
                marker: false,
                // Personalizando o Polígono para ficar com a cara da plataforma
                polygon: {
                  shapeOptions: {
                    color: '#4ade80',
                    fillOpacity: 0.2,
                    weight: 3
                  }
                },
                rectangle: {
                  shapeOptions: {
                    color: '#4ade80',
                    fillOpacity: 0.2,
                    weight: 3
                  }
                }
              }}
            />
          </FeatureGroup>
        </MapContainer>
      </div>
    </div>
  );
}
