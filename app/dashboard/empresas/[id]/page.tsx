import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function EmpresaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();

  const { id } = await params;

  const { data: empresa } =
    await supabase
      .from("empresas_parceiras")
      .select("*")
      .eq("id", id)
      .single();

  if (!empresa) {

    return (
      <main className="p-8 text-white">
        Empresa não encontrada
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <div className="flex gap-3 mb-8">

        <Link
          href="/dashboard/empresas"
          className="bg-[#16253D] px-4 py-2 rounded-xl"
        >
          ← Voltar
        </Link>

        <Link
          href={`/dashboard/empresas/${empresa.id}/editar`}
          className="bg-yellow-600 px-4 py-2 rounded-xl"
        >
          ✏️ Editar
        </Link>

        <Link
          href={`/dashboard/empresas/${empresa.id}/excluir`}
          className="bg-red-700 px-4 py-2 rounded-xl"
        >
          🗑️ Excluir
        </Link>

      </div>

      <h1 className="text-4xl font-bold mb-8">
        {empresa.nome}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">
            Tipo
          </p>
          <p className="text-xl font-bold">
            {empresa.tipo}
          </p>
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">
            Telefone
          </p>
          <p className="text-xl font-bold">
            {empresa.telefone || "-"}
          </p>
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">
            E-mail
          </p>
          <p className="text-xl font-bold">
            {empresa.email || "-"}
          </p>
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">
            Localização
          </p>
          <p className="text-xl font-bold">
            {empresa.cidade} / {empresa.estado}
          </p>
        </div>

      </div>

    </main>
  );
}