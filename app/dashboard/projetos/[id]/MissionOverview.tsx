interface Props {
  projeto: any;
}

export default function MissionOverview({
  projeto,
}: Props) {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-4 mb-4">

        <div className="bg-[#16253D] p-6 rounded-xl">

          <p className="text-slate-400">
            📅 Data do voo
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {projeto.data_voo}
          </h2>

        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">

          <p className="text-slate-400">
            🌾 Área Mapeada
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {projeto.area_mapeada} ha
          </h2>

        </div>

      </div>

      <div className="bg-[#16253D] p-6 rounded-xl mb-8">

        <h2 className="text-2xl font-bold mb-5">
          Indicadores Agronômicos
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div>

            <p className="text-slate-400">
              🟢 Alto Vigor
            </p>

            <h3 className="text-3xl font-bold text-green-400 mt-2">
              {projeto.alto_vigor || 0}%
            </h3>

          </div>

          <div>

            <p className="text-slate-400">
              🟡 Médio Vigor
            </p>

            <h3 className="text-3xl font-bold text-yellow-400 mt-2">
              {projeto.medio_vigor || 0}%
            </h3>

          </div>

          <div>

            <p className="text-slate-400">
              🔴 Baixo Vigor
            </p>

            <h3 className="text-3xl font-bold text-red-400 mt-2">
              {projeto.baixo_vigor || 0}%
            </h3>

          </div>

        </div>

      </div>

      <div className="bg-[#16253D] p-6 rounded-xl mb-8">

        <h2 className="text-2xl font-bold mb-6">
          ✈️ Missão de Voo
        </h2>

        <div className="grid md:grid-cols-2 gap-5">

          <Item
            titulo="Piloto"
            valor={projeto.piloto}
          />

          <Item
            titulo="Drone"
            valor={projeto.drone}
          />

          <Item
            titulo="Câmera"
            valor={projeto.camera}
          />

          <Item
            titulo="Altitude"
            valor={
              projeto.altura_voo
                ? `${projeto.altura_voo} m`
                : "-"
            }
          />

          <Item
            titulo="Sobreposição Frontal"
            valor={
              projeto.sobreposicao_frontal
                ? `${projeto.sobreposicao_frontal}%`
                : "-"
            }
          />

          <Item
            titulo="Sobreposição Lateral"
            valor={
              projeto.sobreposicao_lateral
                ? `${projeto.sobreposicao_lateral}%`
                : "-"
            }
          />

        </div>

      </div>

    </>
  );
}

function Item({
  titulo,
  valor,
}: {
  titulo: string;
  valor: any;
}) {
  return (
    <div>

      <p className="text-slate-400">
        {titulo}
      </p>

      <p className="mt-1">
        {valor || "-"}
      </p>

    </div>
  );
}