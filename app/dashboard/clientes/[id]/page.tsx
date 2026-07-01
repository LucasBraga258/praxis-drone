import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ClientePage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const supabase = await createClient();

  const { id } = await params;

  const { data: cliente } =
    await supabase
      .from("clientes")
      .select("*")
      .eq("id", id)
      .single();

  if (!cliente) {
    return (
      <main className="min-h-screen bg-[#07111F] text-white p-8">
        Cliente não encontrado.
      </main>
    );
  }

  const { data: fazendas } =
    await supabase
      .from("fazendas")
      .select("*")
      .eq("cliente_id", id);

  const quantidadeFazendas =
    fazendas?.length || 0;

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-4xl font-bold">
            {cliente.nome}
          </h1>

          <p className="text-slate-400">
            {cliente.email}
          </p>

        </div>

        <div className="flex gap-3">

          <Link
            href={`/dashboard/clientes/${cliente.id}/editar`}
            className="
              bg-yellow-600
              px-5
              py-3
              rounded-xl
              font-bold
            "
          >
            Editar
          </Link>

          <Link
            href={`/dashboard/clientes/${cliente.id}/excluir`}
            className="
              bg-red-600
              px-5
              py-3
              rounded-xl
              font-bold
            "
          >
            Excluir
          </Link>

        </div>

      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">

        <div className="bg-[#16253D] p-6 rounded-xl">

          <p className="text-slate-400">
            Fazendas
          </p>

          <h2 className="text-4xl font-bold">
            {quantidadeFazendas}
          </h2>

        </div>

      </div>

      <div className="bg-[#16253D] p-6 rounded-xl">

        <h2 className="text-2xl font-bold mb-4">
          Fazendas Vinculadas
        </h2>

        {fazendas?.length ? (

          <div className="space-y-3">

            {fazendas.map((fazenda) => (

              <Link
                key={fazenda.id}
                href={`/dashboard/fazendas/${fazenda.id}`}
                className="
                  block
                  bg-[#0F1C30]
                  p-4
                  rounded-xl
                  hover:bg-[#132440]
                  transition
                "
              >

                <h3 className="font-bold">
                  {fazenda.nome}
                </h3>

                <p className="text-slate-400">
                  {fazenda.cidade} / {fazenda.estado}
                </p>

              </Link>

            ))}

          </div>

        ) : (

          <p className="text-slate-400">
            Nenhuma fazenda vinculada.
          </p>

        )}

      </div>

    </main>
  );
}