import Card from "@/app/components/ui/Card";

interface Job {
  id?: number;
  etapa: string;
  status: string;
  progresso: number;
  created_at?: string;
  iniciado_em?: string | null;
  finalizado_em?: string | null;
}

interface MissionTimelineProps {
  jobs: Job[];
}

function corStatus(status: string) {
  switch (status) {
    case "Concluído":
      return "bg-emerald-500";
    case "Processando":
      return "bg-amber-500";
    case "Erro":
      return "bg-red-500";
    default:
      return "bg-slate-600";
  }
}

function iconeStatus(status: string) {
  switch (status) {
    case "Concluído":
      return "✓";
    case "Processando":
      return "⟳";
    case "Erro":
      return "✕";
    default:
      return "·";
  }
}

export default function MissionTimeline({ jobs }: MissionTimelineProps) {
  if (jobs.length === 0) {
    return null;
  }

  return (
    <Card>
      <h2 className="text-xl font-bold text-white mb-6">
        Histórico da Missão
      </h2>

      <div className="space-y-1">
        {jobs.map((job, index) => (
          <div key={job.id ?? index} className="flex items-start gap-4">
            {/* Linha vertical + bolinha */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  ${corStatus(job.status)}
                  w-4 h-4 rounded-full flex items-center justify-center
                  text-[10px] text-white font-bold shrink-0
                `}
              >
                {iconeStatus(job.status)}
              </div>

              {index !== jobs.length - 1 && (
                <div className="w-[2px] flex-1 bg-slate-700 mt-1 min-h-[32px]" />
              )}
            </div>

            {/* Conteúdo */}
            <div className="flex-1 pb-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  {job.etapa}
                </h3>

                <span
                  className={`
                    text-xs px-2 py-0.5 rounded-full font-medium
                    ${job.status === "Concluído"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : job.status === "Processando"
                      ? "bg-amber-500/15 text-amber-400"
                      : job.status === "Erro"
                      ? "bg-red-500/15 text-red-400"
                      : "bg-slate-700 text-slate-400"
                    }
                  `}
                >
                  {job.status} — {job.progresso}%
                </span>
              </div>

              {(job.iniciado_em || job.finalizado_em) && (
                <div className="flex gap-4 mt-1 text-xs text-slate-500">
                  {job.iniciado_em && (
                    <span>
                      Início: {new Date(job.iniciado_em).toLocaleString("pt-BR")}
                    </span>
                  )}
                  {job.finalizado_em && (
                    <span>
                      Fim: {new Date(job.finalizado_em).toLocaleString("pt-BR")}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}