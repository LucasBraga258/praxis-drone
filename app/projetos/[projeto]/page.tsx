export default async function Projeto({
  params,
}: {
  params: Promise<{ projeto: string }>;
}) {
  const { projeto } = await params;

  return (
    <main className="min-h-screen bg-slate-900 text-white p-10">
      <h1 className="text-4xl font-bold mb-6">
        Projeto {projeto}
      </h1>

      <div className="space-y-4">

        <div>
          <strong>Cliente:</strong> Fazenda Santa Maria
        </div>

        <div>
          <strong>Área:</strong> 120 hectares
        </div>

        <div>
          <strong>Data:</strong> 18/06/2026
        </div>

        <div className="mt-8 bg-slate-800 p-6 rounded-xl">
          Ortomosaico
        </div>

        <div className="bg-slate-800 p-6 rounded-xl">
          NDVI
        </div>

        <div className="bg-slate-800 p-6 rounded-xl">
          Modelo de Elevação
        </div>

        <div className="bg-slate-800 p-6 rounded-xl">
          Link WebGIS
        </div>

      </div>
    </main>
  );
}