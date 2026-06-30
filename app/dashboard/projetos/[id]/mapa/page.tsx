"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";
import { MapContainer, TileLayer, Polygon, Popup, LayersControl, ImageOverlay } from "react-leaflet";
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

export default function WebGISPage() {
  const params = useParams();
  const router = useRouter();
  const projetoId = params.id as string;

  const [mounted, setMounted] = useState(false);
  const [projeto, setProjeto] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.from("projetos").select("*").eq("id", projetoId).single();
      setProjeto(data);
      setCarregando(false);
      setMounted(true);
    }
    carregar();
  }, [projetoId]);

  if (carregando || !mounted) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#07111F] text-emerald-500 gap-4">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        <p className="text-slate-400 animate-pulse">Carregando visualização cartográfica...</p>
      </div>
    );
  }

  if (!projeto?.ortomosaico_img_url) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#07111F] text-white p-8">
        <div className="max-w-md text-center bg-[#0F1C30] p-8 rounded-2xl border border-slate-700">
          <div className="text-4xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold mb-2">Processamento em Andamento</h2>
          <p className="text-slate-400 mb-6">As imagens deste projeto ainda estão sendo processadas pela fotogrametria. O WebGIS será liberado assim que o Ortomosaico for gerado.</p>
          <button onClick={() => router.back()} className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded-xl font-medium transition">
            Voltar para Missão
          </button>
        </div>
      </div>
    );
  }

  // Coordenadas simuladas do talhão (Futuramente extraídas do GeoJSON)
  const bounds: L.LatLngBoundsExpression = [
    [-23.5505, -46.6333],
    [-23.5515, -46.6343]
  ];
  
  const polygon: L.LatLngExpression[] = [
    [-23.5505, -46.6333],
    [-23.5505, -46.6343],
    [-23.5515, -46.6343],
    [-23.5515, -46.6333],
  ];

  return (
    <div className="h-screen w-full relative flex flex-col bg-[#07111F]">
      {/* Header flotante */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex justify-between items-center bg-[#0F1C30]/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-700/50 shadow-2xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-3">
            🌐 WebGIS Interativo
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-medium">
              Missão {projetoId}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Visualize e interaja com os mapas gerados ({projeto.fonte_captura || "Drone"})</p>
        </div>
        
        <button 
          onClick={() => router.back()}
          className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm"
        >
          Voltar para Missão
        </button>
      </div>

      {/* Mapa */}
      <div className="flex-1 w-full h-full z-0">
        <MapContainer 
          bounds={bounds}
          zoom={17} 
          scrollWheelZoom={true} 
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <LayersControl position="bottomright">
            <LayersControl.BaseLayer checked name="Satélite Base (Esri)">
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>

            <LayersControl.Overlay checked name="Contorno do Talhão">
              <Polygon pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1, weight: 3 }} positions={polygon}>
                <Popup>Área Mapeada: {projeto.area_mapeada || 0} ha</Popup>
              </Polygon>
            </LayersControl.Overlay>

            <LayersControl.Overlay checked name="Ortomosaico (RGB)">
              <ImageOverlay
                url={projeto.ortomosaico_img_url}
                bounds={bounds}
                opacity={0.9}
              />
            </LayersControl.Overlay>

            {projeto.ndvi_img_url && (
              <LayersControl.Overlay name="Índice Vegetativo (NDVI)">
                <ImageOverlay
                  url={projeto.ndvi_img_url}
                  bounds={bounds}
                  opacity={0.8}
                />
              </LayersControl.Overlay>
            )}
          </LayersControl>
        </MapContainer>
      </div>
    </div>
  );
}
