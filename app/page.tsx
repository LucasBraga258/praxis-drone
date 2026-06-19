import Link from "next/link";
import { supabase } from "../lib/supabase";

export default async function Home() {
  const { data: fazendas } = await supabase
    .from("fazendas")
    .select("*");

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-5xl font-bold mb-10">
        Praxis Drone
      </h1>

      <div className="space-y-4">
        {fazendas?.map((fazenda) => (
          <Link
            key={fazenda.id}
            href={`/fazendas/${fazenda.id}`}
          >
            <div className="bg-slate-800 p-6 rounded-xl hover:bg-slate-700 transition cursor-pointer">
              <h2 className="text-2xl font-bold">
                {fazenda.nome}
              </h2>

              <p>
                {fazenda.cidade} / {fazenda.estado}
              </p>

              <p>
                Área: {fazenda.area_ha} ha
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}