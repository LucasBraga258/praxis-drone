export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-20">

        <h1 className="text-5xl font-bold mb-6">
          Praxis Drone
        </h1>

        <p className="text-xl text-slate-300 mb-10">
          Mapeamento agrícola, ortomosaicos, NDVI,
          modelos de elevação e relatórios técnicos.
        </p>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-slate-800 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-3">
              Ortomosaico
            </h2>
            <p>
              Imagens georreferenciadas de alta precisão.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-3">
              Saúde Vegetal
            </h2>
            <p>
              Análise NDVI e identificação de falhas.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-3">
              Relatórios Online
            </h2>
            <p>
              Entrega profissional com acesso por senha.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}