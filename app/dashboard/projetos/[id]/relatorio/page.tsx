import Image from "next/image";
import { supabase } from "../../../../lib/supabase";

export default async function RelatorioPage({
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
      <main className="min-h-screen bg-white p-10">
        <h1 className="text-3xl font-bold">
          Projeto não encontrado
        </h1>
      </main>
    );
  }

  return (
    <main className="bg-slate-100 min-h-screen py-10">

      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-10">

        {/* CAPA */}

        <div className="text-center border-b pb-10 mb-10">

          <Image
            src="/logo-praxis.png"
            alt="Praxis Drone"
            width={220}
            height={220}
            className="mx-auto mb-6"
          />

          <h1 className="text-5xl font-bold mb-4">
            Relatório Técnico de Monitoramento
          </h1>

          <p className="text-xl text-slate-500">
            Agricultura de Precisão
          </p>

        </div>

        {/* DADOS DO PROJETO */}

        <div className="bg-slate-50 rounded-xl p-6 mb-10">

          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <strong>Projeto:</strong> {projeto.codigo}
            </div>

            <div>
              <strong>Fazenda:</strong>{" "}
              {projeto.fazendas?.nome}
            </div>

            <div>
              <strong>Data do voo:</strong>{" "}
              {projeto.data_voo}
            </div>

            <div>
              <strong>Status:</strong>{" "}
              {projeto.status}
            </div>

            <div>
              <strong>Área monitorada:</strong>{" "}
              {projeto.area_mapeada} ha
            </div>

            <div>
              <strong>Cultura:</strong>{" "}
              {projeto.cultura || "-"}
            </div>

          </div>

        </div>

        {/* INDICADORES */}

        <div className="grid md:grid-cols-4 gap-4 mb-10">

          <div className="bg-green-100 rounded-xl p-6">
            <p className="text-sm text-slate-600">
              Alto Vigor
            </p>

            <h2 className="text-4xl font-bold text-green-700">
              {projeto.alto_vigor || 0}%
            </h2>
          </div>

          <div className="bg-yellow-100 rounded-xl p-6">
            <p className="text-sm text-slate-600">
              Médio Vigor
            </p>

            <h2 className="text-4xl font-bold text-yellow-700">
              {projeto.medio_vigor || 0}%
            </h2>
          </div>

          <div className="bg-red-100 rounded-xl p-6">
            <p className="text-sm text-slate-600">
              Baixo Vigor
            </p>

            <h2 className="text-4xl font-bold text-red-700">
              {projeto.baixo_vigor || 0}%
            </h2>
          </div>

          <div className="bg-cyan-100 rounded-xl p-6">
            <p className="text-sm text-slate-600">
              Confiança
            </p>

            <h2 className="text-4xl font-bold text-cyan-700">
              {projeto.nivel_confianca || 0}%
            </h2>
          </div>

        </div>

        {/* DADOS TÉCNICOS */}

        <div className="bg-slate-50 rounded-xl p-6 mb-10">

          <h2 className="text-2xl font-bold mb-6">
            Dados Técnicos
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <strong>Município:</strong>{" "}
              {projeto.municipio || "-"}
            </div>

            <div>
              <strong>UF:</strong>{" "}
              {projeto.uf || "-"}
            </div>

            <div>
              <strong>Latitude:</strong>{" "}
              {projeto.latitude || "-"}
            </div>

            <div>
              <strong>Longitude:</strong>{" "}
              {projeto.longitude || "-"}
            </div>

            <div>
              <strong>GSD:</strong>{" "}
              {projeto.gsd || "-"}
            </div>

            <div>
              <strong>Elevação:</strong>{" "}
              {projeto.elevacao_min || "-"} m
              até{" "}
              {projeto.elevacao_max || "-"} m
            </div>

          </div>

        </div>

        {/* IMAGENS */}

        <div className="mb-10">

          <h2 className="text-3xl font-bold mb-6">
            Imagens da Análise
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <div>

              <h3 className="font-bold mb-2">
                Ortomosaico RGB
              </h3>

              <Image
                src={projeto.ortomosaico_img_url}
                alt="Ortomosaico"
                width={600}
                height={400}
                className="rounded-xl border w-full h-auto"
              />

            </div>

            <div>

              <h3 className="font-bold mb-2">
                VARI / NDVI
              </h3>

              <Image
                src={projeto.ndvi_img_url}
                alt="NDVI"
                width={600}
                height={400}
                className="rounded-xl border w-full h-auto"
              />

            </div>

            <div>

              <h3 className="font-bold mb-2">
                Modelo de Elevação
              </h3>

              <Image
                src={projeto.elevacao_img_url}
                alt="Elevação"
                width={600}
                height={400}
                className="rounded-xl border w-full h-auto"
              />

            </div>

          </div>

        </div>

        {/* RELATÓRIO IA */}

        <div className="bg-white border rounded-xl p-8">

          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html:
                projeto.relatorio_html ||
                "<p>Nenhum relatório disponível.</p>",
            }}
          />

        </div>

      </div>

    </main>
  );
}