"use client";
import dynamic from "next/dynamic";

// Wrapper client para MissionFlightMap — `ssr: false` só pode ser usado em Client Components
const MissionFlightMapDynamic = dynamic(() => import("./MissionFlightMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 520,
        background: "#0b1828",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#475569",
        fontSize: 13,
      }}
    >
      🗺️ Carregando mapa do voo...
    </div>
  ),
});

export default function MissionFlightMapClient(props: any) {
  return <MissionFlightMapDynamic {...props} />;
}
