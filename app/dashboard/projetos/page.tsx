import Link from "next/link";
import { supabase } from "../../../lib/supabase";


export default async function ProjetosPage() {
  const { data: projetos } = await supabase
    .from("projetos")
    .select(`
      *,
      fazendas (
        nome
      )
    `)
    .order("id", { ascending: false });
    

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
          Projetos
        </h1>

        <Link
          href="/dashboard/projetos/novo"
          className="bg-[#1E5D2D] px-6 py-3 rounded-xl font-bold hover:opacity-90"
        >
          + Novo Projeto
        </Link>

      </div>

      <div className="space-y-4">

        {projetos?.map((projeto: any) => (

          <a
            href={`/dashboard/projetos/${projeto.id}`}
            key={projeto.id}
            className="block bg-[#16253D] p-6 rounded-xl hover:bg-[#22385B] transition"
          >

            <h2 className="text-2xl font-bold">
              Projeto {projeto.codigo}
            </h2>

            <p className="text-slate-300">
              Fazenda: {projeto.fazendas?.nome}
            </p>

            <p className="text-slate-300">
              Data do voo: {projeto.data_voo}
            </p>

            <p className="text-slate-300">
              Área: {projeto.area_mapeada} ha
            </p>

            <p className="text-green-400 font-semibold mt-2">
              {projeto.status}
            </p>

          </a>

        ))}

        {(!projetos || projetos.length === 0) && (
          <div className="bg-[#16253D] p-6 rounded-xl text-slate-400">
            Nenhum projeto cadastrado.
          </div>
        )}

      </div>

    </main>
  );
}