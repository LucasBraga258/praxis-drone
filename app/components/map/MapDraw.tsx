"use client";

import dynamic from "next/dynamic";

const MapDrawClient = dynamic(() => import("./MapDrawClient"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "400px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-surface)",
        border: "1px solid var(--bg-border)",
        borderRadius: 12,
        color: "var(--text-muted)",
        fontSize: 13,
      }}
    >
      Carregando Ferramenta de Mapeamento...
    </div>
  ),
});

export default function MapDraw(props: any) {
  return <MapDrawClient {...props} />;
}
