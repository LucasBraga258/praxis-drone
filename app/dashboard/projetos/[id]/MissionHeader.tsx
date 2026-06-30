import Badge from "@/app/components/ui/Badge";

interface MissionHeaderProps {
  projeto: {
    id: number;
    codigo: string;
    status: string;
    data_voo: string;
    area_mapeada: number;
    fazendas?: {
      nome: string;
    } | null;
    talhoes?: {
      nome: string;
    } | null;
  };
}

export default function MissionHeader({ projeto }: MissionHeaderProps) {
  const statusColor =
    projeto.status === "Concluído"
      ? "green"
      : projeto.status === "Erro"
      ? "red"
      : projeto.status === "Processando"
      ? "yellow"
      : "gray";

  return (
    <div className="bg-[#0F1C30] rounded-2xl p-6 mb-8 border border-slate-700">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">
              Missão {projeto.codigo}
            </h1>
            <Badge color={statusColor}>{projeto.status}</Badge>
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
            <span>
              Fazenda{" "}
              <span className="text-white font-medium">
                {projeto.fazendas?.nome ?? "—"}
              </span>
            </span>

            <span className="text-slate-600">•</span>

            <span>
              {projeto.data_voo
                ? new Date(projeto.data_voo + "T00:00:00").toLocaleDateString("pt-BR")
                : "—"}
            </span>

            <span className="text-slate-600">•</span>

            <span>{projeto.area_mapeada} ha</span>
          </div>
        </div>
        
        <div className="flex gap-2 self-start lg:self-center">
          <a
            href={`/dashboard/projetos/${projeto.id || ''}/editar`}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <span>✏️</span> Editar
          </a>
          <a
            href={`/dashboard/projetos/${projeto.id || ''}/excluir`}
            className="flex items-center gap-2 bg-red-900/30 hover:bg-red-900/60 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <span>🗑️</span> Excluir
          </a>
        </div>
      </div>
    </div>
  );
}