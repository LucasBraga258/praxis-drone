"use client";
import dynamic from "next/dynamic";

// Wrapper client para TalhaoMap — `ssr: false` só pode ser usado em Client Components
const TalhaoMapDynamic = dynamic(() => import("./TalhaoMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 380,
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
      🗺️ Carregando mapa do talhão...
    </div>
  ),
});

export default function TalhaoMapClient(props: any) {
  return <TalhaoMapDynamic {...props} />;
}
