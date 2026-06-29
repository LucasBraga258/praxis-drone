"use client";

import { useEffect, useState } from "react";
import { buscarPipelineProjeto } from "../../lib/services/processamento";

interface Props {
  projetoId: number;
}

export default function PipelineProjeto({
  projetoId,
}: Props) {
  const [etapas, setEtapas] = useState<any[]>([]);

  useEffect(() => {
    carregar();

    const intervalo = setInterval(() => {
      carregar();
    }, 3000);

    return () => clearInterval(intervalo);
  }, [projetoId]);

  async function carregar() {
    const data = await buscarPipelineProjeto(projetoId);
    setEtapas(Array.isArray(data) ? data : []);
  }

  function corBarra(status: string) {
    switch (status) {
      case "Concluído":
        return "bg-green-500";

      case "Processando":
        return "bg-blue-500";

      case "Erro":
        return "bg-red-500";

      default:
        return "bg-slate-500";
    }
  }

  function iconeStatus(status: string) {
    switch (status) {
      case "Concluído":
        return "✅";

      case "Processando":
        return "🔄";

      case "Erro":
        return "❌";

      default:
        return "⏳";
    }
  }

  return (
    <div className="bg-[#16253D] rounded-xl p-6">

      <h2 className="text-2xl font-bold mb-8">
        ⚙️ Pipeline de Processamento
      </h2>

      {etapas?.map((etapa) => (
        <div
          key={etapa.id}
          className="mb-6"
        >
          {/* Cabeçalho */}

          <div className="flex justify-between items-center mb-2">

            <strong>
              {etapa.etapa}
            </strong>

            <div className="flex items-center gap-3">

              <span>
                {iconeStatus(etapa.status)}
              </span>

              <span>
                {etapa.status}
              </span>

              <span className="text-slate-400 text-sm">
                {etapa.progresso}%
              </span>

            </div>

          </div>

          {/* Barra */}

          <div className="w-full h-3 rounded-full bg-[#0F1C30] overflow-hidden">

            <div
              className={`${corBarra(etapa.status)} h-3 transition-all duration-500`}
              style={{
                width: `${etapa.progresso}%`,
              }}
            />

          </div>

        </div>
      ))}

    </div>
  );
}
