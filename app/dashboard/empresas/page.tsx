import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function EmpresasPage() {
  const supabase = await createClient();

  const { data: empresas } = await supabase
    .from("empresas_parceiras")
    .select("*")
    .order("nome");

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
          Empresas Parceiras
        </h1>

        <Link
          href="/dashboard/empresas/novo"
          className="bg-[#1E5D2D] px-6 py-3 rounded-xl font-bold"
        >
          + Nova Empresa
        </Link>

      </div>

      <div className="space-y-4">

        {empresas?.map((empresa) => (

          <Link
  key={empresa.id}
  href={`/dashboard/empresas/${empresa.id}`}
  className="
    block
    bg-[#16253D]
    p-6
    rounded-xl
    hover:bg-[#1B2D4A]
    transition
  "
>

            <h2 className="text-2xl font-bold">
              {empresa.nome}
            </h2>

            <p className="text-slate-300">
              Tipo: {empresa.tipo}
            </p>

            <p className="text-slate-300">
              {empresa.email || "-"}
            </p>

            <p className="text-slate-300">
              {empresa.telefone || "-"}
            </p>

            <p className="text-slate-400">
              {empresa.cidade} / {empresa.estado}
            </p>

          </Link>

        ))}

      </div>

    </main>
  );
}