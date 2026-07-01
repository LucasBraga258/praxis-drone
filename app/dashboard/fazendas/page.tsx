import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function FazendasPage() {
  const supabase = await createClient();
  const { data: fazendas } = await supabase
  .from("fazendas")
  .select(`
    *,
    agronomos (
      id,
      nome,
      crea
    )
  `)
  .order("id");

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
          Fazendas
        </h1>

        <Link
          href="/dashboard/fazendas/novo"
          className="bg-[#1E5D2D] px-6 py-3 rounded-xl font-bold hover:opacity-90"
        >
          + Nova Fazenda
        </Link>

      </div>

      <div className="space-y-4">

        {fazendas?.map((fazenda) => {

          let statusTexto = "Sem análise";
          let statusCor = "text-slate-400";
          let statusEmoji = "⚪";

          if (fazenda.status_saude === "Saudável") {
            statusTexto = "Saudável";
            statusCor = "text-green-400";
            statusEmoji = "🟢";
          }

          if (fazenda.status_saude === "Atenção") {
            statusTexto = "Atenção";
            statusCor = "text-yellow-400";
            statusEmoji = "🟡";
          }

          if (fazenda.status_saude === "Crítica") {
            statusTexto = "Crítica";
            statusCor = "text-red-400";
            statusEmoji = "🔴";
          }

          return (

            <Link
              key={fazenda.id}
              href={`/dashboard/fazendas/${fazenda.id}`}
              className="
                block
                bg-[#16253D]
                p-6
                rounded-xl
                hover:bg-[#1B2D4A]
                transition
              "
            >

              <div className="flex justify-between items-start">

                <div>

                  <h2 className="text-2xl font-bold">
                    {fazenda.nome}
                  </h2>

                  <p className="text-slate-300">
                    {fazenda.cidade} / {fazenda.estado}
                  </p>

                  <p className="text-slate-300">
                    Área: {fazenda.area_ha} ha
                  </p>

                  <p className="text-slate-300 mt-2">
                    👨‍🌾 Agrônomo:
                    {" "}
                    {fazenda.agronomos?.nome || "Não vinculado"}
                  </p>

                  <p className="text-slate-400 text-sm mt-2">
                    Próximo voo: {fazenda.proximo_voo || "-"}
                  </p>

                </div>

                <div className="text-right">

                  <p
                    className={`font-bold text-lg ${statusCor}`}
                  >
                    {statusEmoji} {statusTexto}
                  </p>

                </div>

              </div>

            </Link>

          );
        })}

      </div>

    </main>
  );
}