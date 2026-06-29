interface Props {
  resultado: any;
}

export default function ValidacaoMissao({
  resultado,
}: Props) {

  if (!resultado) return null;

  return (

    <div className="bg-[#16253D] rounded-xl p-6">

      <h2 className="text-2xl font-bold mb-6">

        ✔ Validação da Missão

      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        <Info
          titulo="🚁 Drone"
          valor={resultado.drone}
        />

        <Info
          titulo="📷 Fotos"
          valor={`${resultado.quantidadeFotos}`}
        />

        <Info
          titulo="📍 GPS"
          valor={
            resultado.latitude
              ? "OK"
              : "Não encontrado"
          }
        />

        <Info
          titulo="📅 Data"
          valor={
            resultado.dataVoo
              ? new Date(
                  resultado.dataVoo
                ).toLocaleDateString("pt-BR")
              : "-"
          }
        />

        <Info
          titulo="📐 Resolução"
          valor={`${resultado.largura} x ${resultado.altura}`}
        />

        <Info
          titulo="💾 Tamanho"
          valor={`${(
            resultado.tamanhoTotal /
            1024 /
            1024 /
            1024
          ).toFixed(2)} GB`}
        />

      </div>

      {resultado.avisos.length > 0 && (

        <div className="mt-8">

          <h3 className="font-bold text-yellow-400">

            ⚠ Avisos

          </h3>

          <ul className="mt-2 space-y-1">

            {resultado.avisos.map(
              (aviso: string) => (

                <li key={aviso}>

                  • {aviso}

                </li>

              )
            )}

          </ul>

        </div>

      )}

      {resultado.erros.length > 0 && (

        <div className="mt-8">

          <h3 className="font-bold text-red-400">

            ❌ Erros

          </h3>

          <ul className="mt-2 space-y-1">

            {resultado.erros.map(
              (erro: string) => (

                <li key={erro}>

                  • {erro}

                </li>

              )
            )}

          </ul>

        </div>

      )}

    </div>

  );

}

function Info({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {

  return (

    <div>

      <p className="text-slate-400">

        {titulo}

      </p>

      <p className="text-xl font-bold">

        {valor}

      </p>

    </div>

  );

}