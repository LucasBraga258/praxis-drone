"use client";
import dynamic from "next/dynamic";

// Re-exporta FarmMap como Client Component wrapper
// para poder usar `ssr: false` que é proibido em Server Components
const FarmMapDynamic = dynamic(() => import("./FarmMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 420,
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
      🗺️ Carregando mapa da fazenda...
    </div>
  ),
});

export default function FarmMapClient(props: any) {
  return <FarmMapDynamic {...props} />;
}
