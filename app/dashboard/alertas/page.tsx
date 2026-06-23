import { supabase } from "../../../lib/supabase";

export default async function AlertasPage() {
  const { data: notificacoes } = await supabase
    .from("notificacoes")
    .select(`
      *,
      fazendas (
        nome
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        🚨 Central de Alertas
      </h1>

      <div className="space-y-4">

        {notificacoes?.length ? (

          notificacoes.map((alerta) => {

            let cor = "border-slate-600";

            if (alerta.tipo === "critico") {
              cor = "border-red-500";
            }

            if (alerta.tipo === "atencao") {
              cor = "border-yellow-500";
            }

            if (alerta.tipo === "info") {
              cor = "border-cyan-500";
            }

            return (

              <div
                key={alerta.id}
                className={`
                  bg-[#16253D]
                  border-l-4
                  ${cor}
                  p-6
                  rounded-xl
                `}
              >

                <h2 className="text-xl font-bold">
                  {alerta.titulo}
                </h2>

                <p className="text-slate-300 mt-2">
                  {alerta.descricao}
                </p>

                <p className="text-slate-500 mt-3 text-sm">
                  Fazenda:
                  {" "}
                  {alerta.fazendas?.nome || "-"}
                </p>

              </div>

            );
          })

        ) : (

          <div className="bg-[#16253D] p-6 rounded-xl">

            Nenhum alerta encontrado.

          </div>

        )}

      </div>

    </main>
  );
}