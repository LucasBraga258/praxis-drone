import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { count: notificacoesNaoLidas } =
  await supabase
    .from("notificacoes")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("lida", false);
  return (
    <div className="min-h-screen bg-[#07111F] text-white">

      <div className="flex">

        <aside
          className="
            w-72
            min-h-screen
            bg-[#0F1C30]
            border-r
            border-slate-800
            p-6
          "
        >

          <h1 className="text-2xl font-bold mb-10">
            🚁 Praxis Drone
          </h1>

          <nav className="space-y-2">

            <Link
              href="/dashboard"
              className="block p-3 rounded-xl hover:bg-[#16253D]"
            >
              🏠 Dashboard
            </Link>

            <Link
              href="/dashboard/clientes"
              className="block p-3 rounded-xl hover:bg-[#16253D]"
            >
              👥 Clientes
            </Link>

            <Link
              href="/dashboard/fazendas"
              className="block p-3 rounded-xl hover:bg-[#16253D]"
            >
              🌱 Fazendas
            </Link>

            <Link
              href="/dashboard/projetos"
              className="block p-3 rounded-xl hover:bg-[#16253D]"
            >
              🚁 Projetos
            </Link>

            <Link
              href="/dashboard/agronomos"
              className="block p-3 rounded-xl hover:bg-[#16253D]"
            >
              👨‍🌾 Agrônomos
            </Link>

            <Link href="/dashboard/intervencoes"
            className="block p-3 rounded-xl hover:bg-[#16253D]"
            >
              🧪 Intervenções
            </Link>

            <Link
              href="/dashboard/empresas"
              className="block p-3 rounded-xl hover:bg-[#16253D]"
            >
              🏢 Empresas
            </Link>

            <Link
              href="/dashboard/alertas"
              className="block p-3 rounded-xl hover:bg-[#16253D]"
            >
              🚨 Alertas
            </Link>

            <Link
              href="/dashboard/usuarios"
              className="block p-3 rounded-xl hover:bg-[#16253D]"
            >
              🔐 Usuários
            </Link>

          </nav>

        </aside>

        <div className="flex-1">

          <header
            className="
              h-20
              border-b
              border-slate-800
              px-8
              flex
              items-center
              justify-between
              bg-[#07111F]
            "
          >

            <div>

              <h2 className="text-xl font-bold">
                Plataforma Praxis
              </h2>

            </div>

            <div className="flex items-center gap-6">

             <Link
  href="/dashboard/alertas"
  className="
    relative
    text-2xl
    hover:scale-110
    transition
  "
>
  🔔

  {(notificacoesNaoLidas || 0) > 0 && (
    <span
      className="
        absolute
        -top-2
        -right-2
        bg-red-600
        text-white
        text-xs
        w-5
        h-5
        rounded-full
        flex
        items-center
        justify-center
      "
    >
      {notificacoesNaoLidas}
    </span>
  )}
</Link>

              <div
                className="
                  bg-[#16253D]
                  px-4
                  py-2
                  rounded-xl
                "
              >
                Lucas
              </div>

            </div>

          </header>

          <main>

            {children}

          </main>

        </div>

      </div>

    </div>
  );
}