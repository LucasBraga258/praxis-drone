import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";

export default async function FazendaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: fazenda } = await supabase
    .from("fazendas")
    .select("*")
    .eq("id", id)
    .single();

  const { data: projetos } = await supabase
    .from("projetos")
    .select("*")
    .eq("fazenda_id", id);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-5xl font-bold mb-2">
        {fazenda?.nome}
      </h1>

      <p className="text-slate-400 mb-8">
        {fazenda?.cidade} / {fazenda?.estado}
      </p>

      <h2 className="text-2xl font-bold mb-4">
        Projetos
      </h2>

      <div className="space-y-4">
        {projetos?.map((projeto) => (
          <Link
            key={projeto.id}
            href={`/projetos/${projeto.id}`}
          >
            <div className="bg-slate-800 p-6 rounded-xl hover:bg-slate-700 transition">
              <h3 className="text-xl font-bold">
                Projeto {projeto.codigo}
              </h3>

              <p>
                Área: {projeto.area_mapeada} ha
              </p>

              <p>
                Status: {projeto.status}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}