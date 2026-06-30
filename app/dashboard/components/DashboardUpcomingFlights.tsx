interface Fazenda {
  id: number;
  nome: string;
  proximo_voo: string;
}

interface Props {
  fazendas: Fazenda[];
}

export default function DashboardUpcomingFlights({
  fazendas,
}: Props) {
  return (
    <div className="bg-[#16253D] rounded-2xl p-6">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-2xl font-bold">
            🚁 Próximos Monitoramentos
          </h2>

          <p className="text-slate-400 mt-1">
            Missões programadas
          </p>

        </div>

      </div>

      {fazendas.length === 0 ? (

        <p className="text-slate-400">
          Nenhum monitoramento programado.
        </p>

      ) : (

        <div className="space-y-4">

          {fazendas.map((fazenda) => {

            const dias = Math.ceil(
              (
                new Date(fazenda.proximo_voo).getTime() -
                Date.now()
              ) /
              (1000 * 60 * 60 * 24)
            );

            return (

              <div
                key={fazenda.id}
                className="
                  bg-[#0F1C30]
                  rounded-xl
                  p-4
                  flex
                  justify-between
                  items-center
                "
              >

                <div>

                  <h3 className="font-semibold">
                    {fazenda.nome}
                  </h3>

                  <p className="text-slate-400 text-sm">
                    {fazenda.proximo_voo}
                  </p>

                </div>

                {dias >= 0 ? (

                  <span className="text-green-400 font-semibold">
                    {dias} dias
                  </span>

                ) : (

                  <span className="text-red-400 font-semibold">
                    Vencido
                  </span>

                )}

              </div>

            );

          })}

        </div>

      )}

    </div>
  );
}