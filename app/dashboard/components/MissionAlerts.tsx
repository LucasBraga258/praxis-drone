import Link from "next/link";
import { Missao } from "@/lib/services/projetos";

interface Props {
  missoes: Missao[];
}

export default function MissionAlerts({
  missoes,
}: Props) {

  const alertas = missoes.filter((m) => {
    if (m.status === "Erro") return true;

    const jobs = m.jobs_processamento ?? [];

    return jobs.some(
      (job) => job.status === "Erro"
    );
  });

  return (
    <div className="bg-[#16253D] rounded-2xl p-6">

      <h2 className="text-2xl font-bold mb-6">
        🚨 Missões que precisam de atenção
      </h2>

      {alertas.length === 0 ? (

        <div className="bg-green-900/20 border border-green-700 rounded-xl p-5">

          <h3 className="text-green-400 font-bold">
            Tudo certo!
          </h3>

          <p className="text-slate-300 mt-2">
            Nenhuma missão apresenta erros no momento.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {alertas.map((missao) => (

            <div
              key={missao.id}
              className="bg-red-900/20 border border-red-700 rounded-xl p-5 flex justify-between items-center"
            >

              <div>

                <h3 className="font-bold text-lg">
                  🚁 {missao.codigo}
                </h3>

                <p className="text-slate-300">
                  🌾 {missao.fazendas?.nome}
                </p>

                <p className="text-red-400 mt-2">
                  Status: {missao.status}
                </p>

              </div>

              <Link
                href={`/dashboard/projetos/${missao.id}`}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
              >
                Abrir
              </Link>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}