import Link from "next/link";

interface DashboardStatsProps {
  clientes: number;
  fazendas: number;
  projetos: number;
  agronomos: number;
  empresas: number;
  pragasAtivas: number;
  intervencoes: number;
  alertasPendentes: number;
  areaMonitorada: number;
  monitoramentosVencidos: number;
}

function Card({
  titulo,
  valor,
  href,
  emoji,
  cor = "text-white",
  subtitulo,
}: {
  titulo: string;
  valor: number | string;
  href: string;
  emoji: string;
  cor?: string;
  subtitulo?: string;
}) {
  return (
    <Link
      href={href}
      className="
        bg-[#16253D]
        rounded-2xl
        p-6
        hover:bg-[#1D3353]
        transition
        border border-slate-700
      "
    >
      <p className="text-slate-400">
        {emoji} {titulo}
      </p>

      <h2 className={`text-4xl font-bold mt-2 ${cor}`}>
        {valor}
      </h2>

      {subtitulo && (
        <p className="text-slate-500 text-sm mt-2">
          {subtitulo}
        </p>
      )}
    </Link>
  );
}

export default function DashboardStats({
  clientes,
  fazendas,
  projetos,
  agronomos,
  empresas,
  pragasAtivas,
  intervencoes,
  alertasPendentes,
  areaMonitorada,
  monitoramentosVencidos,
}: DashboardStatsProps) {
  return (
    <div className="grid md:grid-cols-5 gap-6 mb-10">

      <Card
        titulo="Clientes"
        valor={clientes}
        href="/dashboard/clientes"
        emoji="👥"
      />

      <Card
        titulo="Fazendas"
        valor={fazendas}
        href="/dashboard/fazendas"
        emoji="🌱"
      />

      <Card
        titulo="Missões"
        valor={projetos}
        href="/dashboard/projetos"
        emoji="🚁"
      />

      <Card
        titulo="Agrônomos"
        valor={agronomos}
        href="/dashboard/agronomos"
        emoji="👨‍🌾"
      />

      <Card
        titulo="Empresas"
        valor={empresas}
        href="/dashboard/empresas"
        emoji="🏢"
      />

      <Card
        titulo="Pragas"
        valor={pragasAtivas}
        href="/dashboard/pragas"
        emoji="🐛"
        cor="text-yellow-400"
      />

      <Card
        titulo="Intervenções"
        valor={intervencoes}
        href="/dashboard/intervencoes"
        emoji="🧪"
      />

      <Card
        titulo="Alertas"
        valor={alertasPendentes}
        href="/dashboard/alertas"
        emoji="🚨"
        cor="text-red-400"
      />

      <Card
        titulo="Área Monitorada"
        valor={areaMonitorada}
        href="/dashboard/fazendas"
        emoji="🌾"
        subtitulo="hectares"
      />

      <Card
        titulo="Vencidos"
        valor={monitoramentosVencidos}
        href="/dashboard/alertas"
        emoji="⚠️"
        cor="text-red-400"
      />

    </div>
  );
}