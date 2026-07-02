"use client";

import { useState } from "react";

export default function SyncSatelliteButton({ talhaoId }: { talhaoId: number }) {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      await fetch("/api/pipeline/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talhaoId })
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      style={{
        padding: "9px 18px",
        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
        color: "#fff",
        borderRadius: "var(--radius-md)",
        textDecoration: "none",
        fontSize: 13,
        fontWeight: 700,
        boxShadow: "0 4px 14px rgba(59,130,246,0.25)",
        border: "none",
        cursor: loading ? "wait" : "pointer",
        opacity: loading ? 0.7 : 1
      }}
    >
      {loading ? "Sincronizando..." : "📡 Buscar Satélite"}
    </button>
  );
}
