"use client";

import { useState } from "react";
import RainInputModal from "./RainInputModal";

export default function RainInputButton({ talhaoId }: { talhaoId: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: "9px 14px",
          background: "var(--bg-hover)",
          border: "1px solid var(--bg-border)",
          color: "#3b82f6",
          borderRadius: "var(--radius-md)",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        🌧️ Registrar Chuva
      </button>

      <RainInputModal 
        talhaoId={talhaoId} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onSuccess={() => {
          // Apenas um reload para atualizar os cards (simplificado)
          window.location.reload();
        }} 
      />
    </>
  );
}
