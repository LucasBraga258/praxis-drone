"use client";
import React from "react";

export default function MissionActions({ projetoId }: { projetoId: number }) {
  const analisar = async () => {
    await fetch(`/api/analisar-imagens`, {
      method: "POST",
      body: JSON.stringify({ projetoId }),
      headers: { "Content-Type": "application/json" },
    });
    alert("Análise iniciada");
  };

  const gerarRelatorio = async () => {
    await fetch(`/api/gerar-relatorio`, {
      method: "POST",
      body: JSON.stringify({ projetoId }),
      headers: { "Content-Type": "application/json" },
    });
    alert("Geração de relatório iniciada");
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm">
      <h3 className="font-semibold mb-3">Ações</h3>

      <div className="flex gap-3">
        <button onClick={analisar} className="px-4 py-2 bg-blue-600 text-white rounded">
          Analisar Imagens
        </button>

        <button onClick={gerarRelatorio} className="px-4 py-2 bg-indigo-600 text-white rounded">
          Gerar Relatório
        </button>
      </div>
    </div>
  );
}
