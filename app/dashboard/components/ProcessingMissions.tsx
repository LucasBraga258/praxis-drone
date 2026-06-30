import Link from "next/link";
import { Missao } from "@/lib/services/projetos";

interface Props {
  missoes: Missao[];
}

export default function ProcessingMissions({
  missoes,
}: Props) {
  if (missoes.length === 0) {
    return (
      <div className="bg-[#16253D] rounded-2xl p-6">

        <h2 className="text-2xl font-bold mb-5">
          🚁 Missões em andamento
        </h2>

        <p className="text-slate-400">
          Nenhuma missão em processamento.
        </p>

      </div>
    );
  }

  return (
    <div className="bg-[#16253D] rounded-2xl p-6">

      <h2 className="text-2xl font-bold mb-6">
        🚁 Missões em andamento
      </h2>

      <div className="space-y-5">

        {missoes.map((missao) => {

          const jobs = missao.jobs_processamento ?? [];

          const progresso = jobs.length
            ? Math.round(
                jobs.reduce(
                  (soma, job) => soma + job.progresso,
                  0
                ) / jobs.length
              )
            : 0;

          const etapaAtual =
            jobs
              .filter(
                (j) => j.status !== "Concluído"
              )
              .sort(
                (a, b) => a.ordem - b.ordem
              )[0];

          return (

            <div
              key={missao.id}
              className="bg-[#0F1C30] rounded-xl p-5"
            >

              <div className="flex justify-between items-center">

                <div>

                  <h3 className="text-xl font-bold">
                    🚁 {missao.codigo}
                  </h3>

                  <p className="text-slate-400">
                    🌾 {missao.fazendas?.nome}
                  </p>

                </div>

                <span className="text-green-400 font-bold">
                  {progresso}%
                </span>

              </div>

              <div className="w-full bg-slate-700 rounded-full h-2 mt-5">

                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${progresso}%`,
                  }}
                />

              </div>

              <div className="flex justify-between items-center mt-4">

                <p className="text-slate-300">

                  Etapa atual:

                  {" "}

                  <strong>
                    {etapaAtual?.etapa ?? "Finalizado"}
                  </strong>

                </p>

                <Link
                  href={`/dashboard/projetos/${missao.id}`}
                  className="text-green-400 hover:underline"
                >
                  Abrir →
                </Link>

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
}