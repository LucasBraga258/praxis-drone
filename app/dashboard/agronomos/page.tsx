import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default async function AgronomosPage() {

  const { data: agronomos } = await supabase
    .from("agronomos")
    .select("*")
    .order("nome");

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
          Agrônomos
        </h1>

        <Link
          href="/dashboard/agronomos/novo"
          className="bg-[#1E5D2D] px-6 py-3 rounded-xl font-bold"
        >
          + Novo Agrônomo
        </Link>

      </div>

      <div className="space-y-4">

        {agronomos?.map((agronomo) => (

         <Link
  key={agronomo.id}
  href={`/dashboard/agronomos/${agronomo.id}`}
  className="block bg-[#16253D] p-6 rounded-xl hover:bg-[#1B2D4A] transition"
>

            <h2 className="text-2xl font-bold">
              {agronomo.nome}
            </h2>

            <p className="text-slate-300">
              CREA: {agronomo.crea || "-"}
            </p>

            <p className="text-slate-300">
              {agronomo.email || "-"}
            </p>

            <p className="text-slate-300">
              {agronomo.telefone || "-"}
            </p>

          </Link>

        ))}

      </div>

    </main>
  );
}