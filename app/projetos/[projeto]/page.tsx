import { createClient } from "../../../lib/supabase/server";
import Image from "next/image";

export default async function ProjetoPage({
  params,
}: {
  params: Promise<{ projeto: string }>;
}) {
  const { projeto } = await params;
  const supabase = await createClient();

  const { data: dadosProjeto } = await supabase
    .from("projetos")
    .select("*")
    .eq("id", projeto)
    .single();

  if (!dadosProjeto) {
    return (
      <main className="min-h-screen bg-[#07111F] text-white p-10">
        <h1 className="text-3xl font-bold">
          Projeto não encontrado
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-10">

      <div className="mb-8">
        <Image
          src="/logo-praxis.png"
          alt="Praxis Drone"
          width={300}
          height={120}
          priority
        />
      </div>

      <h1 className="text-5xl font-bold mb-2">
        Projeto {dadosProjeto.codigo}
      </h1>

      <p className="text-slate-300 mb-10">
        Data do voo: {dadosProjeto.data_voo}
      </p>

      <div className="bg-[#1E5D2D] border border-[#3F8F2E] p-8 rounded-2xl mb-8">
        <h2 className="text-3xl font-bold mb-4">
          Situação Geral: Boa
        </h2>

        <p>
          Monitoramento concluído com sucesso.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-300">
            Área Mapeada
          </p>

          <h3 className="text-3xl font-bold">
            {dadosProjeto.area_mapeada} ha
          </h3>
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-300">
            Status
          </p>

          <h3 className="text-3xl font-bold">
            {dadosProjeto.status}
          </h3>
        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-4">

        <a
  href={`/projetos/${dadosProjeto.id}/relatorio`}
  className="bg-[#16253D] p-6 rounded-xl hover:bg-[#22385B] transition"
>
  <div className="text-3xl mb-2">
    📄
  </div>

  <h3 className="font-bold text-xl">
    Relatório Técnico
  </h3>

  <p className="text-slate-300">
    Visualizar relatório
  </p>
</a>

        <a
          href={dadosProjeto.ndvi_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#16253D] p-6 rounded-xl hover:bg-[#22385B] transition"
        >
          <div className="text-3xl mb-2">
            🌱
          </div>

          <h3 className="font-bold text-xl">
            NDVI
          </h3>

          <p className="text-slate-300">
            Visualizar índice vegetativo
          </p>
        </a>

        <a
          href={dadosProjeto.ortomosaico_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#16253D] p-6 rounded-xl hover:bg-[#22385B] transition"
        >
          <div className="text-3xl mb-2">
            🛰️
          </div>

          <h3 className="font-bold text-xl">
            Ortomosaico
          </h3>

          <p className="text-slate-300">
            Visualizar ortomosaico
          </p>
        </a>

        <a
          href={dadosProjeto.webgis_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#16253D] p-6 rounded-xl hover:bg-[#22385B] transition"
        >
          <div className="text-3xl mb-2">
            🗺️
          </div>

          <h3 className="font-bold text-xl">
            WebGIS
          </h3>

          <p className="text-slate-300">
            Abrir mapa interativo
          </p>
        </a>

      </div>

    </main>
  );
}