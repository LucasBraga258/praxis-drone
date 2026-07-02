"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";

const WebGISMap = dynamic(() => import("./WebGISMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-[#0F1C30] text-emerald-500">Carregando mapa...</div>
});

export default function WebGISPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const projetoId = params.id as string;

  const [mounted, setMounted] = useState(false);
  const [projeto, setProjeto] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  // Estados do Satélite
  const [mapMode, setMapMode] = useState<"satellite" | "drone">("satellite");
  const [layerType, setLayerType] = useState<"rgb" | "ndvi" | "vari" | "falsa_cor">("rgb");
  const [satelliteScenes, setSatelliteScenes] = useState<any[]>([]);
  const [selectedScene, setSelectedScene] = useState<any>(null);
  const [loadingSatellite, setLoadingSatellite] = useState(false);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.from("projetos").select("*, fazendas (id, nome, cidade, estado), talhoes (id, latitude, longitude, area_hectares, bbox_geojson)").eq("id", projetoId).single();
      setProjeto(data);
      
      if (data?.fonte_captura === "Satelite") {
        setMapMode("satellite");
      }
      
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

  const talhaoRaw = projeto?.talhoes;
  const talhao = Array.isArray(talhaoRaw) ? talhaoRaw[0] : talhaoRaw;
  const initialCenter = talhao?.latitude && talhao?.longitude 
    ? [talhao.latitude, talhao.longitude] 
    : [-14.235, -51.925]; // Centro do Brasil padrão

  const mapZoom = talhao?.latitude ? 16 : 5;

  let bounds: any = [];
  let polygon: any = [];
  
  if (talhao?.bbox_geojson) {
    try {
      const bboxObj = typeof talhao.bbox_geojson === 'string' ? JSON.parse(talhao.bbox_geojson) : talhao.bbox_geojson;
      let coords;
      if (bboxObj.type === 'Feature') coords = bboxObj.geometry.coordinates[0];
      else if (bboxObj.geometry) coords = bboxObj.geometry.coordinates[0];
      else coords = bboxObj.coordinates ? bboxObj.coordinates[0] : undefined;
      
      if (coords && coords.length > 0) {
        bounds = [
          [coords[0][1], coords[0][0]],
          [coords[2][1], coords[2][0]]
        ];
        
        // Populate polygon from bbox_geojson since it contains the actual shape
        polygon = coords.map((c: any) => [c[1], c[0]]);
      }
    } catch (e) {
      console.error("Erro ao fazer parse do bbox_geojson no webgis", e);
    }
  }

  const hasDroneData = !!projeto?.ortomosaico_img_url && projeto?.fonte_captura !== "Satelite";
  const hasSatelliteData = projeto?.fonte_captura === "Satelite" || !!projeto?.ndvi_img_url;

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
          <p className="text-sm text-slate-400 mt-1">Monitoramento por Satélite e Drone</p>
        </div>

        <div className="flex bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setMapMode("satellite")}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${mapMode === "satellite" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            🛰️ Satélite (Padrão)
          </button>
          <button
            onClick={() => {
              if (hasDroneData) setMapMode("drone");
            }}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${mapMode === "drone" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"} ${!hasDroneData ? "opacity-50 cursor-not-allowed" : ""}`}
            title={!hasDroneData ? "Imagens de drone ainda não processadas" : ""}
          >
            🚁 Drone (Alta Precisão)
          </button>
        </div>
        
        <button 
          onClick={() => router.back()}
          className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm"
        >
          Voltar para Missão
        </button>
      </div>

      {/* Satellite Timeline / Control Panel */}
      {/* Satellite Controls */}
      {mapMode === "satellite" && (
        <div className="absolute top-24 right-6 z-[400] bg-[#0F1C30]/95 backdrop-blur-md p-3 rounded-2xl border border-slate-700/50 shadow-2xl flex flex-col gap-2 w-48">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Camadas de Satélite</h3>
            <button 
              onClick={() => setLayerType("rgb")}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition text-left ${layerType === "rgb" ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"}`}
            >
              🌍 Cor Real
            </button>
            {projeto?.ndvi_img_url && (
              <button 
                onClick={() => setLayerType("ndvi")}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition text-left ${layerType === "ndvi" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"}`}
              >
                🟢 NDVI (Saúde)
              </button>
            )}
            {projeto?.vari_img_url && (
              <button 
                onClick={() => setLayerType("vari")}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition text-left ${layerType === "vari" ? "bg-amber-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"}`}
              >
                🟡 VARI (Vigor)
              </button>
            )}
            {projeto?.falsa_cor_img_url && (
              <button 
                onClick={() => setLayerType("falsa_cor")}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition text-left ${layerType === "falsa_cor" ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"}`}
              >
                🔴 Falsa Cor
              </button>
            )}
        </div>
      )}

      {/* Drone Controls */}
      {mapMode === "drone" && (
        <div className="absolute top-24 right-6 z-[400] bg-[#0F1C30]/95 backdrop-blur-md p-3 rounded-2xl border border-slate-700/50 shadow-2xl flex flex-col gap-2 w-48">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Camadas do Drone</h3>
            <button 
              onClick={() => setLayerType("rgb")}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition text-left ${layerType === "rgb" ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"}`}
            >
              🗺️ Ortomosaico
            </button>
            {projeto.ndvi_img_url && (
              <button 
                onClick={() => setLayerType("ndvi")}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition text-left ${layerType === "ndvi" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"}`}
              >
                🟢 NDVI (Alta Res.)
              </button>
            )}
        </div>
      )}

      {/* Mapa */}
      <div className="flex-1 w-full h-full z-0">
        <WebGISMap 
          bounds={bounds}
          polygon={polygon}
          mapMode={mapMode}
          layerType={layerType}
          projeto={projeto}
          initialCenter={initialCenter}
          mapZoom={mapZoom}
        />
      </div>
    </div>
  );
}
