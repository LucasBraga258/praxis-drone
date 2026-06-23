import { supabase } from "../../../../lib/supabase";

export default async function ProjetoAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: projeto } = await supabase
    .from("projetos")
    .select(`
      *,
      fazendas (
        nome
      )
    `)
    .eq("id", id)
    .single();

  if (!projeto) {
    return (
      <main className="min-h-screen bg-[#07111F] text-white p-10">
        <h1 className="text-3xl font-bold">
          Projeto não encontrado
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-2">
        Projeto {projeto.codigo}
      </h1>

      <p className="text-slate-400 mb-8">
        Fazenda: {projeto.fazendas?.nome}
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-4">

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">
            Data do voo
          </p>

          <h2 className="text-2xl font-bold">
            {projeto.data_voo}
          </h2>
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <p className="text-slate-400">
            Área Mapeada
          </p>

          <h2 className="text-2xl font-bold">
            {projeto.area_mapeada} ha
          </h2>
        </div>

      </div>

      <div className="bg-[#16253D] p-6 rounded-xl mb-8">

        <p className="text-slate-400">
          Status
        </p>

        <h2 className="text-2xl font-bold text-green-400">
          {projeto.status}
        </h2>

      </div>

      <div className="bg-[#16253D] p-6 rounded-xl mb-8">

        <h2 className="text-2xl font-bold mb-4">
          Indicadores Agronômicos
        </h2>

        <div className="grid md:grid-cols-3 gap-4">

          <div>
            <p className="text-slate-400">
              Alto Vigor
            </p>

            <h3 className="text-3xl font-bold text-green-400">
              {projeto.alto_vigor || 0}%
            </h3>
          </div>

          <div>
            <p className="text-slate-400">
              Médio Vigor
            </p>

            <h3 className="text-3xl font-bold text-yellow-400">
              {projeto.medio_vigor || 0}%
            </h3>
          </div>

          <div>
            <p className="text-slate-400">
              Baixo Vigor
            </p>

            <h3 className="text-3xl font-bold text-red-400">
              {projeto.baixo_vigor || 0}%
            </h3>
          </div>

        </div>

      </div>

      <div className="bg-[#16253D] p-6 rounded-xl mb-8">

        <h2 className="text-2xl font-bold mb-4">
          Dados Técnicos
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <p className="text-slate-400">
              Cultura
            </p>

            <p>
              {projeto.cultura || "-"}
            </p>
          </div>

          <div>
            <p className="text-slate-400">
              Município / UF
            </p>

            <p>
              {projeto.municipio || "-"} / {projeto.uf || "-"}
            </p>
          </div>

          <div>
            <p className="text-slate-400">
              GSD
            </p>

            <p>
              {projeto.gsd || "-"}
            </p>
          </div>

          <div>
            <p className="text-slate-400">
              Coordenadas
            </p>

            <p>
              {projeto.latitude || "-"}, {projeto.longitude || "-"}
            </p>
          </div>

          <div>
            <p className="text-slate-400">
              Elevação Mínima
            </p>

            <p>
              {projeto.elevacao_min || "-"}
            </p>
          </div>

          <div>
            <p className="text-slate-400">
              Elevação Máxima
            </p>

            <p>
              {projeto.elevacao_max || "-"}
            </p>
          </div>

        </div>

      </div>

      <div className="bg-[#16253D] p-6 rounded-xl mb-8">

        <h2 className="text-2xl font-bold mb-4">
          Links do Projeto
        </h2>

        <div className="space-y-4">

          <div>
            <p className="text-slate-400 mb-1">
              NDVI
            </p>

            {projeto.ndvi_url ? (
              <a
                href={projeto.ndvi_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 underline"
              >
                Abrir NDVI
              </a>
            ) : (
              <p className="text-slate-500">
                Não informado
              </p>
            )}
          </div>

          <div>
            <p className="text-slate-400 mb-1">
              Ortomosaico
            </p>

            {projeto.ortomosaico_url ? (
              <a
                href={projeto.ortomosaico_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 underline"
              >
                Abrir Ortomosaico
              </a>
            ) : (
              <p className="text-slate-500">
                Não informado
              </p>
            )}
          </div>

          <div>
            <p className="text-slate-400 mb-1">
              WebGIS
            </p>

            {projeto.webgis_url ? (
              <a
                href={projeto.webgis_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 underline"
              >
                Abrir WebGIS
              </a>
            ) : (
              <p className="text-slate-500">
                Não informado
              </p>
            )}
          </div>

        </div>

      </div>

      <div className="flex flex-wrap gap-4">

        <a
          href={`/projetos/${projeto.id}`}
          target="_blank"
          className="bg-green-700 px-6 py-3 rounded-xl font-bold"
        >
          Visualizar Projeto Público
        </a>

        <a
          href={`/dashboard/projetos/${projeto.id}/editar`}
          className="bg-blue-700 px-6 py-3 rounded-xl font-bold"
        >
          Editar Projeto
        </a>

        <a
          href={`/dashboard/projetos/${projeto.id}/diagnostico`}
          className="bg-purple-700 px-6 py-3 rounded-xl font-bold"
        >
          Diagnóstico
        </a>

      </div>

    </main>
  );
}