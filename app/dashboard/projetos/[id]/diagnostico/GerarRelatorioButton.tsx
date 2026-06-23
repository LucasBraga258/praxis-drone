"use client";

import { useRouter } from "next/navigation";

export default function GerarRelatorioButton({
  projeto,
}: {
  projeto: any;
}) {
  const router = useRouter();

  async function gerarRelatorio() {
    try {
      const response = await fetch(
        "/api/gerar-relatorio",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projetoId: projeto.id,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      alert(
        "Relatório gerado com sucesso!"
      );

      router.push(
        `/projetos/${projeto.id}/relatorio`
      );

    } catch (error) {
      console.error(error);

      alert(
        "Erro ao gerar relatório"
      );
    }
  }

  return (
    <button
      onClick={gerarRelatorio}
      className="bg-purple-700 px-6 py-3 rounded-xl font-bold hover:bg-purple-800"
    >
      Gerar Relatório
    </button>
  );
}