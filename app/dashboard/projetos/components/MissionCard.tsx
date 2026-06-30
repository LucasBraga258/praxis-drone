import Link from "next/link";
import { Missao } from "@/lib/services/projetos";
import Badge from "@/app/components/ui/Badge";
import Card from "@/app/components/ui/Card";

interface Props {
  projeto: Missao;
}

export default function MissionCard({ projeto }: Props) {
  const statusColor =
    projeto.status === "Concluído"
      ? "green"
      : projeto.status === "Erro"
      ? "red"
      : projeto.status === "Processando"
      ? "yellow"
      : "gray";

      const progresso =
    projeto.jobs_processamento?.length
        ? Math.round(

            projeto.jobs_processamento.reduce(

                (acc, etapa) =>

                    acc + etapa.progresso,

                0

            ) /

            projeto.jobs_processamento.length

        )

        : 0;

  return (
    <Card className="hover:border-green-600 transition-all">

      <div className="flex justify-between items-start">

        <div>

          <h2 className="text-2xl font-bold">
            🚁 Missão {projeto.codigo}
          </h2>

          <p className="text-slate-400 mt-2">
            🌾 {projeto.fazendas?.nome ?? "Sem fazenda"}
          </p>

        </div>

        <Badge color={statusColor}>
          {projeto.status}
        </Badge>

      </div>

      <div className="grid grid-cols-2 gap-5 mt-6">

        <div>
          <p className="text-slate-500 text-sm">
            Piloto
          </p>

          <p>{projeto.piloto}</p>
        </div>

        <div>
          <p className="text-slate-500 text-sm">
            Drone
          </p>

          <p>{projeto.drone}</p>
        </div>

        <div>
          <p className="text-slate-500 text-sm">
            Data
          </p>

          <p>{projeto.data_voo}</p>
        </div>

        <div>
          <p className="text-slate-500 text-sm">
            Área
          </p>

          <p>{projeto.area_mapeada} ha</p>
        </div>

      </div>

      <div className="mt-6">

        <div className="flex justify-between text-sm mb-2">

          <span>Pipeline</span>


        </div>

        <div className="w-full bg-slate-700 rounded-full h-2">

          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: "10%" }}
          />

        </div>
<span>

{progresso}%

</span>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="flex gap-2">
          <Link
            href={`/dashboard/projetos/${projeto.id}/editar`}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            title="Editar Missão"
          >
            ✏️
          </Link>
          <Link
            href={`/dashboard/projetos/${projeto.id}/excluir`}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-900/30 transition"
            title="Excluir Missão"
          >
            🗑️
          </Link>
        </div>

        <Link
          href={`/dashboard/projetos/${projeto.id}`}
          className="
            bg-green-600
            hover:bg-green-700
            px-5
            py-2
            rounded-lg
            font-medium
            transition
          "
        >
          Abrir Missão
        </Link>
      </div>

    </Card>
  );
}