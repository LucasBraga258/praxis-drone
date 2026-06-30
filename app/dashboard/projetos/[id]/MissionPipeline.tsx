import ProgressBar from "@/app/components/ui/ProgressBar";

interface Props {
  jobs: {
    etapa: string;
    status: string;
    progresso: number;
  }[];
}

export default function MissionPipeline({
  jobs,
}: Props) {

  const progresso =
    jobs.length
      ? Math.round(
          jobs.reduce(
            (acc, job) =>
              acc + job.progresso,
            0
          ) / jobs.length
        )
      : 0;

  return (

    <div className="bg-[#16253D] rounded-2xl p-6">

      <h2 className="text-xl font-bold mb-5">

        Pipeline

      </h2>

      <div className="flex justify-between mb-3">

        <span>Progresso Geral</span>

        <span>{progresso}%</span>

      </div>

      <ProgressBar value={progresso} />

      <div className="mt-6 space-y-3">

        {jobs.map((job) => (

          <div
            key={job.etapa}
            className="
              flex
              justify-between
              items-center
              bg-slate-800
              rounded-xl
              px-4
              py-3
            "
          >

            <span>

              {job.etapa}

            </span>

            <span>

              {job.status}

            </span>

          </div>

        ))}

      </div>

    </div>

  );

}