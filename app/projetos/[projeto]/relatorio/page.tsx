import { supabase } from "../../../../lib/supabase";
import Image from "next/image";

export default async function RelatorioPage({
  params,
}: {
  params: Promise<{ projeto: string }>;
}) {
  const { projeto } = await params;

  const { data: dadosProjeto } = await supabase
    .from("projetos")
    .select("*")
    .eq("id", projeto)
    .single();

  if (!dadosProjeto) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h1 className="text-3xl font-bold">
          Projeto não encontrado
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">

      <div className="max-w-6xl mx-auto p-6 md:p-10">

        {/* LOGO */}

        <div className="mb-10">
          <Image
            src="/logo-praxis.png"
            alt="Praxis Drone"
            width={220}
            height={100}
            priority
          />
        </div>

        {/* TÍTULO */}

        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Relatório Técnico de Monitoramento
        </h1>

        {/* BOTÃO PDF */}

        {dadosProjeto.relatorio_url && (
          <a
            href={dadosProjeto.relatorio_url}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex
              items-center
              gap-2
              bg-green-700
              text-white
              px-6
              py-3
              rounded-xl
              hover:bg-green-800
              transition
              mb-8
            "
          >
            ⬇️ Baixar PDF
          </a>
        )}

        {/* RESUMO */}

        <div className="bg-white shadow-sm p-6 rounded-2xl mb-10">

          <p className="mb-2">
            <strong>Projeto:</strong>{" "}
            {dadosProjeto.codigo}
          </p>

          <p className="mb-2">
            <strong>Data do voo:</strong>{" "}
            {dadosProjeto.data_voo}
          </p>

          <p className="mb-2">
            <strong>Status:</strong>{" "}
            {dadosProjeto.status}
          </p>

          <p>
            <strong>Área monitorada:</strong>{" "}
            {dadosProjeto.area_mapeada} ha
          </p>

        </div>

        {/* INDICADORES */}

        <div className="grid md:grid-cols-4 gap-4 mb-10">

          <div className="bg-green-100 p-6 rounded-xl">
            <p className="text-sm text-slate-600">
              Alto Vigor
            </p>

            <h2 className="text-4xl font-bold text-green-700">
              {dadosProjeto.alto_vigor || 0}%
            </h2>
          </div>

          <div className="bg-yellow-100 p-6 rounded-xl">
            <p className="text-sm text-slate-600">
              Médio Vigor
            </p>

            <h2 className="text-4xl font-bold text-yellow-700">
              {dadosProjeto.medio_vigor || 0}%
            </h2>
          </div>

          <div className="bg-red-100 p-6 rounded-xl">
            <p className="text-sm text-slate-600">
              Baixo Vigor
            </p>

            <h2 className="text-4xl font-bold text-red-700">
              {dadosProjeto.baixo_vigor || 0}%
            </h2>
          </div>

          <div className="bg-cyan-100 p-6 rounded-xl">
            <p className="text-sm text-slate-600">
              Nível de Confiança
            </p>

            <h2 className="text-4xl font-bold text-cyan-700">
              {dadosProjeto.nivel_confianca || 0}%
            </h2>
          </div>

        </div>

        {/* DADOS TÉCNICOS */}

        <div className="bg-white shadow-sm rounded-2xl p-8 mb-10">

          <h2 className="text-3xl font-bold mb-6">
            Dados Técnicos
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <strong>Cultura:</strong>{" "}
              {dadosProjeto.cultura || "-"}
            </div>

            <div>
              <strong>Município:</strong>{" "}
              {dadosProjeto.municipio || "-"} / {dadosProjeto.uf || "-"}
            </div>

            <div>
              <strong>Latitude:</strong>{" "}
              {dadosProjeto.latitude || "-"}
            </div>

            <div>
              <strong>Longitude:</strong>{" "}
              {dadosProjeto.longitude || "-"}
            </div>

            <div>
              <strong>GSD:</strong>{" "}
              {dadosProjeto.gsd || "-"}
            </div>

            <div>
              <strong>Elevação:</strong>{" "}
              {dadosProjeto.elevacao_min || "-"} m até{" "}
              {dadosProjeto.elevacao_max || "-"} m
            </div>

          </div>

        </div>

        {/* IMAGENS */}

        <div className="bg-white shadow-sm rounded-2xl p-8 mb-10">

          <h2 className="text-3xl font-bold mb-6">
            Imagens da Análise
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <div>

              <h3 className="font-semibold mb-3">
                Ortomosaico RGB
              </h3>

              <img
                src={dadosProjeto.ortomosaico_img_url}
                alt="Ortomosaico"
                className="rounded-xl border"
              />

            </div>

            <div>

              <h3 className="font-semibold mb-3">
                VARI / NDVI
              </h3>

              <img
                src={dadosProjeto.ndvi_img_url}
                alt="NDVI"
                className="rounded-xl border"
              />

            </div>

            <div>

              <h3 className="font-semibold mb-3">
                Modelo de Elevação
              </h3>

              <img
                src={dadosProjeto.elevacao_img_url}
                alt="Elevação"
                className="rounded-xl border"
              />

            </div>

          </div>

        </div>

        {/* RELATÓRIO IA */}

        <div
          className="
            bg-white
            shadow-sm
            rounded-2xl
            p-8

            [&_h1]:text-4xl
            [&_h1]:font-bold
            [&_h1]:mb-6

            [&_h2]:text-2xl
            [&_h2]:font-bold
            [&_h2]:text-green-700
            [&_h2]:mt-10
            [&_h2]:mb-4

            [&_h3]:text-xl
            [&_h3]:font-semibold
            [&_h3]:mt-6
            [&_h3]:mb-3

            [&_p]:mb-4
            [&_p]:leading-7

            [&_ul]:list-disc
            [&_ul]:pl-8
            [&_ul]:mb-6

            [&_li]:mb-2

            [&_table]:w-full
            [&_table]:border-collapse
            [&_table]:my-6

            [&_th]:border
            [&_th]:p-3
            [&_th]:bg-slate-100

            [&_td]:border
            [&_td]:p-3
          "
          dangerouslySetInnerHTML={{
            __html:
              dadosProjeto.relatorio_html ||
              "<p>Nenhum relatório disponível.</p>",
          }}
        />

        {/* RODAPÉ */}

        <div className="mt-16 pt-8 border-t border-slate-300">

          <h3 className="font-bold text-xl">
            Praxis Drone
          </h3>

          <p className="text-slate-500">
            Tecnologia prática para o campo
          </p>

        </div>

      </div>

    </main>
  );
}