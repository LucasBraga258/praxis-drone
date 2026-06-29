interface MissionHeaderProps {
  projeto: {
    codigo: string;
    status: string;
    data_voo: string;
    area_mapeada: number;

    piloto: string | null;
    drone: string | null;
    camera: string | null;

    altura_voo: number | null;
    sobreposicao_frontal: number | null;
    sobreposicao_lateral: number | null;

    fazendas?: {
      nome: string;
    } | null;
  };
}

function Campo({
  titulo,
  valor,
}: {
  titulo: string;
  valor: React.ReactNode;
}) {
  return (
    <div className="bg-[#16253D] rounded-xl p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        {titulo}
      </p>

      <p className="text-white font-semibold mt-1">
        {valor ?? "-"}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cores: Record<string, string> = {
    Processando: "bg-yellow-500/20 text-yellow-400",
    Concluído: "bg-green-500/20 text-green-400",
    Erro: "bg-red-500/20 text-red-400",
    Aguardando: "bg-slate-600 text-slate-200",
  };

  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-semibold ${
        cores[status] ??
        "bg-blue-500/20 text-blue-400"
      }`}
    >
      {status}
    </span>
  );
}

export default function MissionHeader({
  projeto,
}: MissionHeaderProps) {
  return (
    <div className="bg-[#0F1C30] rounded-2xl p-6 mb-8 border border-slate-700">

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        <div>

          <h1 className="text-3xl font-bold text-white">
            Projeto {projeto.codigo}
          </h1>

          <p className="text-slate-400 mt-2">
            Fazenda{" "}
            <span className="text-white font-medium">
              {projeto.fazendas?.nome ?? "-"}
            </span>
          </p>

        </div>

        <StatusBadge status={projeto.status} />

      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">

        <Campo
          titulo="Data do voo"
          valor={projeto.data_voo}
        />

        <Campo
          titulo="Área"
          valor={`${projeto.area_mapeada} ha`}
        />

        <Campo
          titulo="Piloto"
          valor={projeto.piloto}
        />

        <Campo
          titulo="Drone"
          valor={projeto.drone}
        />

        <Campo
          titulo="Câmera"
          valor={projeto.camera}
        />

        <Campo
          titulo="Altura"
          valor={
            projeto.altura_voo
              ? `${projeto.altura_voo} m`
              : "-"
          }
        />

        <Campo
          titulo="Sobreposição Frontal"
          valor={
            projeto.sobreposicao_frontal
              ? `${projeto.sobreposicao_frontal}%`
              : "-"
          }
        />

        <Campo
          titulo="Sobreposição Lateral"
          valor={
            projeto.sobreposicao_lateral
              ? `${projeto.sobreposicao_lateral}%`
              : "-"
          }
        />

      </div>

    </div>
  );
}