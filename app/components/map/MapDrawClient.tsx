"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// Corrige o ícone padrão do Leaflet no Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapDrawClientProps {
  onDrawComplete: (geojson: any, center: { lat: number; lng: number }, areaHa?: number) => void;
  existingGeojson?: any; // To display existing boundary (e.g. parent fazenda boundary)
  height?: string;
  drawType?: "polygon" | "point"; // Se queremos polígono ou apenas um ponto
  flyToLocation?: { lat: number; lng: number } | null; // Se passado, o mapa "vôa" pra lá
}

function MapFlyTo({ location }: { location: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 13, { duration: 1.5 });
    }
  }, [location, map]);
  return null;
}

function CustomGeoJSONLayer({ data }: { data: any }) {
  const map = useMap();
  
  useEffect(() => {
    if (!data) return;
    try {
      const layer = L.geoJSON(data, {
        style: {
          color: "#4ade80",
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.1,
          dashArray: "4 4"
        }
      }).addTo(map);

      // Fit bounds if it's the first time
      map.fitBounds(layer.getBounds(), { padding: [20, 20] });

      return () => {
        map.removeLayer(layer);
      };
    } catch (e) {
      console.error("Error parsing existingGeojson", e);
    }
  }, [data, map]);

  return null;
}

export default function MapDrawClient({ onDrawComplete, existingGeojson, height = "400px", drawType = "polygon", flyToLocation = null }: MapDrawClientProps) {
  const featureGroupRef = useRef<any>(null);

  const _onCreated = (e: any) => {
    const { layerType, layer } = e;
    
    // Pegar o GeoJSON do layer recém desenhado
    const geojson = layer.toGeoJSON();
    
    let center = { lat: 0, lng: 0 };
    let areaHa = 0;
    
    if (layerType === "marker") {
      center = { lat: layer.getLatLng().lat, lng: layer.getLatLng().lng };
    } else {
      const bounds = layer.getBounds();
      center = { lat: bounds.getCenter().lat, lng: bounds.getCenter().lng };
      try {
        const areaSqMeters = turf.area(geojson);
        areaHa = areaSqMeters / 10000;
      } catch (err) {
        console.error("Erro ao calcular área com turf", err);
      }
    }

    // Se só quisermos 1 polígono por vez, apagamos os outros do featureGroup
    const featureGroup = featureGroupRef.current;
    if (featureGroup) {
      featureGroup.clearLayers();
      featureGroup.addLayer(layer);
    }

    onDrawComplete(geojson, center, areaHa);
  };

  const _onDeleted = () => {
    onDrawComplete(null, { lat: 0, lng: 0 }, 0);
  };

  const _onEdited = (e: any) => {
    const layers = e.layers;
    let geojson: any = null;
    let center = { lat: 0, lng: 0 };
    let areaHa = 0;
    
    layers.eachLayer((layer: any) => {
      geojson = layer.toGeoJSON();
      if (layer.getBounds) {
        const bounds = layer.getBounds();
        center = { lat: bounds.getCenter().lat, lng: bounds.getCenter().lng };
        try {
          const areaSqMeters = turf.area(geojson);
          areaHa = areaSqMeters / 10000;
        } catch (err) {
          console.error("Erro ao calcular área com turf", err);
        }
      } else {
         center = { lat: layer.getLatLng().lat, lng: layer.getLatLng().lng };
      }
    });

    if (geojson) {
      onDrawComplete(geojson, center, areaHa);
    }
  };

  return (
    <div style={{ height, width: "100%", borderRadius: 12, overflow: "hidden", border: "1px solid var(--bg-border)", zIndex: 1 }}>
      <MapContainer 
        center={[-15.7801, -47.9292]} // Centro do Brasil Default
        zoom={4} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <MapFlyTo location={flyToLocation} />
        
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          maxZoom={19}
        />

        {existingGeojson && (
          <CustomGeoJSONLayer data={existingGeojson} />
        )}

        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={_onCreated}
            onDeleted={_onDeleted}
            onEdited={_onEdited}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              polyline: false,
              polygon: drawType === "polygon" ? {
                allowIntersection: false,
                drawError: {
                  color: '#e1e100',
                  message: '<strong>Ops!</strong> você não pode cruzar as linhas.' 
                },
                shapeOptions: {
                  color: '#4ade80'
                }
              } : false,
              marker: drawType === "point",
            }}
          />
        </FeatureGroup>

      </MapContainer>
    </div>
  );
}
