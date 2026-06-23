"use client";

import { useState } from "react";

export default function AnalisarImagensButton({
  projetoId,
}: {
  projetoId: number;
}) {
  const [analisando, setAnalisando] = useState(false);

  async function analisar() {
    try {
      setAnalisando(true);

      const response = await fetch(
        "/api/analisar-imagens",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projetoId,
          }),
        }
      );

      const data = await response.json();

      alert(
        data.message ||
          "Análise concluída"
      );

      location.reload();

    } catch (error) {
      console.error(error);

      alert(
        "Erro ao analisar imagens"
      );
    } finally {
      setAnalisando(false);
    }
  }

  return (
    <button
      onClick={analisar}
      disabled={analisando}
      className="bg-purple-700 px-6 py-3 rounded-xl font-bold hover:bg-purple-800"
    >
      {analisando
        ? "Analisando..."
        : "Analisar Imagens"}
    </button>
  );
}