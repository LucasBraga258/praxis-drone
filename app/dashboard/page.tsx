export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto p-8">

        <h1 className="text-4xl font-bold mb-2">
          Dashboard
        </h1>

        <p className="text-slate-400 mb-8">
          Bem-vindo, João da Silva
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-10">

          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="text-slate-400">
              Fazendas
            </div>

            <div className="text-4xl font-bold">
              3
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="text-slate-400">
              Projetos
            </div>

            <div className="text-4xl font-bold">
              12
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl">
            <div className="text-slate-400">
              Último Voo
            </div>

            <div className="text-2xl font-bold">
              18/06/2026
            </div>
          </div>

        </div>

        <h2 className="text-2xl font-bold mb-4">
          Minhas Fazendas
        </h2>

        <div className="space-y-4">

          <a
            href="/fazendas/boa-esperanca"
            className="block bg-slate-800 p-6 rounded-xl hover:bg-slate-700 transition"
          >
            🌱 Fazenda Boa Esperança
          </a>

          <a
            href="/fazendas/santa-maria"
            className="block bg-slate-800 p-6 rounded-xl hover:bg-slate-700 transition"
          >
            🌾 Fazenda Santa Maria
          </a>

          <a
            href="/fazendas/sao-joao"
            className="block bg-slate-800 p-6 rounded-xl hover:bg-slate-700 transition"
          >
            🚜 Fazenda São João
          </a>

        </div>

      </div>
    </main>
  );
}