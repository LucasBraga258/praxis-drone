import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AgronomoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: agronomo } = await supabase
    .from("agronomos")
    .select("*")
    .eq("id", id)
    .single();

  if (!agronomo) {
    return (
      <main className="min-h-screen bg-[#07111F] text-white p-8">
        Agrônomo não encontrado
      </main>
    );
  }

  const { data: fazendas } = await supabase
    .from("fazendas")
    .select("*")
    .eq("agronomo_id", id)
    .order("nome");

  const quantidadeFazendas =
    fazendas?.length || 0;

  const totalArea =
    fazendas?.reduce(
      (acc, fazenda) =>
        acc + Number(fazenda.area_ha || 0),
      0
    ) || 0;

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-2">
        {agronomo.nome}
      </h1>

      <p className="text-slate-400 mb-8">
        Perfil do Agrônomo
      </p>

      <div className="flex gap-3 mb-8">

  <Link
    href="/dashboard/agronomos"
    className="bg-[#16253D] px-4 py-2 rounded-xl"
  >
    ← Voltar
  </Link>

  <Link
    href={`/dashboard/agronomos/${id}/editar`}
    className="bg-yellow-600 px-4 py-2 rounded-xl"
  >
    ✏️ Editar
  </Link>

  <Link
    href={`/dashboard/agronomos/${id}/excluir`}
    className="bg-red-700 px-4 py-2 rounded-xl"
  >
    🗑️ Excluir
  </Link>

</div>

      <div className="grid md:grid-cols-4 gap-4 mb-10">

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">
            CREA
          </p>

          <h2 className="text-xl font-bold">
            {agronomo.crea || "-"}
          </h2>
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">
            Telefone
          </p>

          <h2 className="text-xl font-bold">
            {agronomo.telefone || "-"}
          </h2>
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">
            Fazendas
          </p>

          <h2 className="text-xl font-bold">
            {quantidadeFazendas}
          </h2>
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">
            Área Total
          </p>

          <h2 className="text-xl font-bold">
            {totalArea} ha
          </h2>
        </div>

      </div>

      <div className="bg-[#16253D] p-6 rounded-xl mb-8">

        <h2 className="text-2xl font-bold mb-4">
          Informações
        </h2>

        <p className="mb-2">
          <strong>Email:</strong>{" "}
          {agronomo.email || "-"}
        </p>

        <p>
          <strong>Telefone:</strong>{" "}
          {agronomo.telefone || "-"}
        </p>

      </div>

      <div className="bg-[#16253D] p-6 rounded-xl">

        <h2 className="text-2xl font-bold mb-6">
          Fazendas Atendidas
        </h2>

        {fazendas?.length ? (

          <div className="space-y-4">

            {fazendas.map((fazenda) => (

              <div
                key={fazenda.id}
                className="bg-[#0F1C30] p-4 rounded-xl flex justify-between items-center"
              >

                <div>

                  <h3 className="text-xl font-bold">
                    {fazenda.nome}
                  </h3>

                  <p className="text-slate-300">
                    {fazenda.cidade} / {fazenda.estado}
                  </p>

                  <p className="text-slate-400">
                    Área: {fazenda.area_ha} ha
                  </p>

                </div>

                <Link
                  href={`/dashboard/fazendas/${fazenda.id}`}
                  className="bg-green-700 px-4 py-2 rounded-lg"
                >
                  Abrir Fazenda
                </Link>

              </div>

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