import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default async function IntervencoesPage() {

  const { data: intervencoes } =
  await supabase
    .from("intervencoes")
    .select(`
      *,
      fazendas (
        id,
        nome
      ),
      empresas_parceiras (
        id,
        nome
      )
    `)
    .order(
      "data_intervencao",
      { ascending: false }
    );

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
          🧪 Intervenções
        </h1>

        <Link
          href="/dashboard/intervencoes/novo"
          className="
            bg-green-700
            px-6
            py-3
            rounded-xl
            font-bold
          "
        >
          + Nova Intervenção
        </Link>

      </div>

      <div className="space-y-4">

        {intervencoes?.map(
          (intervencao: any) => (

          <div
            key={intervencao.id}
            className="
              bg-[#16253D]
              rounded-xl
              p-6
            "
          >

            <div className="flex justify-between">

              <div>

                <h2 className="text-2xl font-bold">

                  {intervencao.tipo || "-"}

                </h2>

                <p className="text-slate-300">

                  📅 {intervencao.data_intervencao}

                </p>

                <p className="text-slate-300">

                  🚜 Fazenda:
                  {" "}
                  {intervencao.fazendas?.nome || "-"}

                </p>

                <p className="text-slate-300">

                  🐛 Praga:
                  {" "}
                  {intervencao.praga || "-"}

                </p>

                <p className="text-slate-300">

                  🧪 Produto:
                  {" "}
                  {intervencao.produto || "-"}

                </p>

                <p className="text-slate-300">

                  💉 Dose:
                  {" "}
                  {intervencao.dose || "-"}

                </p>

                <p className="text-slate-300">

                  🌾 Área:
                  {" "}
                  {intervencao.area_aplicada || 0}
                  {" "}ha

                </p>

                <p className="text-slate-300">

                  💰 Custo:
                  {" "}
                  R$
                  {" "}
                  {intervencao.custo || 0}

                </p>

                <p className="text-slate-300">

                  🏢 Empresa:
                  {" "}
                  {intervencao.empresas_parceiras?.nome || "-"}

                </p>

                <p className="text-slate-300">

                  👨‍🌾 Responsável:
                  {" "}
                  {intervencao.responsavel || "-"}

                </p>

              </div>

              <div className="flex gap-2 h-fit">

                <Link
                  href={`/dashboard/intervencoes/${intervencao.id}/editar`}
                  className="
                    bg-yellow-600
                    px-4
                    py-2
                    rounded-lg
                    font-bold
                  "
                >
                  Editar
                </Link>

                <Link
                  href={`/dashboard/intervencoes/${intervencao.id}/excluir`}
                  className="
                    bg-red-700
                    px-4
                    py-2
                    rounded-lg
                    font-bold
                  "
                >
                  Excluir
                </Link>

              </div>

            </div>

            {intervencao.observacoes && (

              <div
                className="
                  mt-4
                  p-4
                  rounded-lg
                  bg-[#0E1B2F]
                "
              >

                <p className="font-bold mb-2">
                  Observações
                </p>

                <p>
                  {intervencao.observacoes}
                </p>

              </div>

            )}

          </div>

        ))}

      </div>

    </main>
  );
}