import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PragasPage() {
  const supabase = await createClient();

  const { data: pragas } =
    await supabase
      .from("pragas")
      .select(`
        *,
        fazendas (
          nome
        )
      `)
      .order(
        "data_identificacao",
        {
          ascending: false,
        }
      );

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
          🐛 Controle de Pragas
        </h1>

        <Link
          href="/dashboard/pragas/novo"
          className="
            bg-green-700
            px-6
            py-3
            rounded-xl
            font-bold
          "
        >
          + Nova Praga
        </Link>

      </div>

      <div className="space-y-4">

        {pragas?.map((praga) => (

          <Link
            key={praga.id}
            href={`/dashboard/pragas/${praga.id}`}
            className="
              block
              bg-[#16253D]
              p-6
              rounded-xl
              hover:bg-[#1B2D4A]
            "
          >

            <h2 className="text-2xl font-bold">
              {praga.nome}
            </h2>

            <p className="text-slate-300">
              🚜 {praga.fazendas?.nome}
            </p>

            <p className="text-slate-300">
              📅 {praga.data_identificacao}
            </p>

            <p className="text-slate-300">
              📊 {praga.nivel_infestacao}
            </p>

            <p className="text-slate-300">
              Status: {praga.status}
            </p>

          </Link>

        ))}

      </div>

    </main>
  );
}