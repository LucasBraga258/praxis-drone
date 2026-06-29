import Link from "next/link";
import { supabase } from "../../lib/supabase";
import DashboardChartsServer from "./DashboardChartsServer";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    periodo?: string;
  }>;
}) {
  const params =
  await searchParams;

const periodo =
  Number(
    params.periodo || "30"
  );

const dataLimite =
  new Date();

dataLimite.setDate(
  dataLimite.getDate() - periodo
);
  const { count: clientes } = await supabase
    .from("clientes")
    .select("*", { count: "exact", head: true });

  const { count: fazendas } = await supabase
    .from("fazendas")
    .select("*", { count: "exact", head: true });

  const { count: projetos } = await supabase
  .from("projetos")
  .select("*", {
    count: "exact",
    head: true,
  })
  .gte(
    "data_voo",
    dataLimite
      .toISOString()
      .split("T")[0]
  );

  const { data: proximosVoos } = await supabase
    .from("fazendas")
    .select("*")
    .not("proximo_voo", "is", null)
    .order("proximo_voo", {
      ascending: true,
    })
    .limit(10);

  const monitoramentosVencidos =
    proximosVoos?.filter(
      (fazenda) =>
        new Date(fazenda.proximo_voo) <
        new Date()
    ) || [];
    const { count: agronomos } = await supabase
  .from("agronomos")
  .select("*", {
    count: "exact",
    head: true,
  });

const { count: empresas } = await supabase
  .from("empresas_parceiras")
  .select("*", {
    count: "exact",
    head: true,
  });
  const { count: pragasAtivas } = await supabase
  .from("pragas")
  .select("*", {
    count: "exact",
    head: true,
  })
  .neq("status", "Resolvida");

const { count: intervencoes } = await supabase
  .from("intervencoes")
  .select("*", {
    count: "exact",
    head: true,
  });

const { count: alertasPendentes } = await supabase
  .from("notificacoes")
  .select("*", {
    count: "exact",
    head: true,
  })
  .eq("lida", false);

const { data: fazendasData } = await supabase
  .from("fazendas")
  .select("area_ha");

const areaMonitorada =
  fazendasData?.reduce(
    (total, fazenda) =>
      total + Number(fazenda.area_ha || 0),
    0
  ) || 0;

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        Dashboard Praxis Drone
      </h1>
      <div className="flex gap-3 mb-8">

  <Link
    href="/dashboard?periodo=7"
    className={`
      px-4 py-2 rounded-lg
      ${
        periodo === 7
          ? "bg-green-600"
          : "bg-[#16253D]"
      }
    `}
  >
    7 dias
  </Link>

  <Link
    href="/dashboard?periodo=30"
    className={`
      px-4 py-2 rounded-lg
      ${
        periodo === 30
          ? "bg-green-600"
          : "bg-[#16253D]"
      }
    `}
  >
    30 dias
  </Link>

  <Link
    href="/dashboard?periodo=90"
    className={`
      px-4 py-2 rounded-lg
      ${
        periodo === 90
          ? "bg-green-600"
          : "bg-[#16253D]"
      }
    `}
  >
    90 dias
  </Link>

  <Link
    href="/dashboard?periodo=365"
    className={`
      px-4 py-2 rounded-lg
      ${
        periodo === 365
          ? "bg-green-600"
          : "bg-[#16253D]"
      }
    `}
  >
    12 meses
  </Link>

</div>

      <div className="grid md:grid-cols-4 gap-6 mb-10">

        <Link
  href="/dashboard/clientes"
  className="
    bg-[#16253D]
    p-6
    rounded-2xl
    block
    hover:bg-[#1B2D4A]
    transition
  "
>
  <p className="text-slate-300">
    👥 Clientes
  </p>

  <h2 className="text-4xl font-bold">
    {clientes || 0}
  </h2>
</Link>

<Link
  href="/dashboard/fazendas"
  className="
    bg-[#16253D]
    p-6
    rounded-2xl
    block
    hover:bg-[#1B2D4A]
    transition
  "
>
  <p className="text-slate-300">
    🌱 Fazendas
  </p>

  <h2 className="text-4xl font-bold">
    {fazendas || 0}
  </h2>
</Link>

<Link
  href="/dashboard/projetos"
  className="
    bg-[#16253D]
    p-6
    rounded-2xl
    block
    hover:bg-[#1B2D4A]
    transition
  "
>
  <p className="text-slate-300">
    🚁 Projetos
  </p>

  <h2 className="text-4xl font-bold">
    {projetos || 0}
  </h2>
</Link>

<Link
  href="/dashboard/agronomos"
  className="
    bg-[#16253D]
    p-6
    rounded-2xl
    block
    hover:bg-[#1B2D4A]
    transition
  "
>
  <p className="text-slate-300">
    👨‍🌾 Agrônomos
  </p>

  <h2 className="text-4xl font-bold">
    {agronomos || 0}
  </h2>
</Link>

<Link
  href="/dashboard/empresas"
  className="
    bg-[#16253D]
    p-6
    rounded-2xl
    block
    hover:bg-[#1B2D4A]
    transition
  "
>
  <p className="text-slate-300">
    🏢 Empresas
  </p>

  <h2 className="text-4xl font-bold">
    {empresas || 0}
  </h2>
</Link>

<Link
  href="/dashboard/pragas"
  className="
    bg-[#16253D]
    p-6
    rounded-2xl
    block
    hover:bg-[#1B2D4A]
    transition
  "
>
  <p className="text-slate-300">
    🐛 Pragas Ativas
  </p>

  <h2 className="text-4xl font-bold text-yellow-400">
    {pragasAtivas || 0}
  </h2>
</Link>
<Link
  href="/dashboard/intervencoes"
  className="
    bg-[#16253D]
    p-6
    rounded-2xl
    block
    hover:bg-[#1B2D4A]
    transition
  "
>
  <p className="text-slate-300">
    🧪 Intervenções
  </p>

  <h2 className="text-4xl font-bold">
    {intervencoes || 0}
  </h2>
</Link>

<Link
  href="/dashboard/alertas"
  className="
    bg-[#16253D]
    p-6
    rounded-2xl
    block
    hover:bg-[#1B2D4A]
    transition
  "
>
  <p className="text-slate-300">
    🚨 Alertas
  </p>

  <h2 className="text-4xl font-bold text-red-400">
    {alertasPendentes || 0}
  </h2>
</Link>

<Link
  href="/dashboard/fazendas"
  className="
    bg-[#16253D]
    p-6
    rounded-2xl
    block
    hover:bg-[#1B2D4A]
    transition
  "
>
  <p className="text-slate-300">
    🌾 Área Monitorada
  </p>

  <h2 className="text-4xl font-bold">
    {areaMonitorada}
  </h2>

  <p className="text-slate-400 text-sm">
    hectares
  </p>
</Link>

<Link
  href="/dashboard/alertas"
  className="
    bg-[#16253D]
    p-6
    rounded-2xl
    block
    hover:bg-[#1B2D4A]
    transition
  "
>
  <p className="text-slate-300">
    ⚠️ Vencidos
  </p>

  <h2 className="text-4xl font-bold text-red-400">
    {monitoramentosVencidos.length}
  </h2>
</Link>

      </div>
<DashboardChartsServer />
      {/* Próximos Monitoramentos */}

      <div className="bg-[#16253D] p-6 rounded-2xl mb-8">

        <h2 className="text-2xl font-bold mb-4">
          🚁 Próximos Monitoramentos
        </h2>

        {proximosVoos?.length ? (

          <div className="space-y-4">

            {proximosVoos.map((fazenda) => {

              const diasRestantes = Math.ceil(
                (
                  new Date(fazenda.proximo_voo).getTime() -
                  new Date().getTime()
                ) /
                (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={fazenda.id}
                  className="bg-[#0F1C30] p-4 rounded-xl"
                >
                  <h3 className="font-bold text-lg">
                    {fazenda.nome}
                  </h3>

                  <p className="text-slate-300">
                    Próximo voo:
                    {" "}
                    {fazenda.proximo_voo}
                  </p>

                  {diasRestantes >= 0 ? (
                    <p className="text-green-400">
                      Faltam {diasRestantes} dias
                    </p>
                  ) : (
                    <p className="text-red-400">
                      Vencido há{" "}
                      {Math.abs(diasRestantes)} dias
                    </p>
                  )}
                </div>
              );
            })}

          </div>

        ) : (

          <p className="text-slate-400">
            Nenhum monitoramento programado.
          </p>

        )}

      </div>

      {/* Monitoramentos Vencidos */}

      <div className="bg-[#16253D] p-6 rounded-2xl mb-10">

        <h2 className="text-2xl font-bold mb-4 text-red-400">
          ⚠ Monitoramentos Vencidos
        </h2>

        {monitoramentosVencidos.length ? (

          <div className="space-y-4">

            {monitoramentosVencidos.map((fazenda) => (

              <div
                key={fazenda.id}
                className="
                  bg-red-900/20
                  border
                  border-red-800
                  p-4
                  rounded-xl
                "
              >
                <h3 className="font-bold">
                  {fazenda.nome}
                </h3>

                <p>
                  Voo previsto:
                  {" "}
                  {fazenda.proximo_voo}
                </p>
              </div>

            ))}

          </div>

        ) : (

          <p className="text-slate-400">
            Nenhum monitoramento vencido.
          </p>

        )}

      </div>

      

    </main>
  );
}