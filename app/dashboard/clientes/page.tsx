import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .order("nome");

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
          Clientes
        </h1>

        <Link
          href="/dashboard/clientes/novo"
          className="bg-[#1E5D2D] px-6 py-3 rounded-xl font-bold hover:opacity-90"
        >
          + Novo Cliente
        </Link>

      </div>

      <div className="space-y-4">

        {clientes?.map((cliente) => (

          <Link
            key={cliente.id}
            href={`/dashboard/clientes/${cliente.id}`}
            className="
              block
              bg-[#16253D]
              p-6
              rounded-xl
              hover:bg-[#1B2D4A]
              transition
            "
          >

            <div className="flex justify-between items-center">

              <div>

                <h2 className="text-2xl font-bold">
                  {cliente.nome}
                </h2>

                <p className="text-slate-300">
                  {cliente.email || "-"}
                </p>

                <p className="text-slate-400">
                  {cliente.telefone || "-"}
                </p>

              </div>

              <div className="text-right">

                <p className="text-green-400 font-semibold">
                  Ver Cliente →
                </p>

              </div>

            </div>

          </Link>

        ))}

      </div>

    </main>
  );
}