"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function TalhaoPage() {
  const params = useParams();

  const talhaoId = Number(params.id);

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-4xl font-bold">
            🌱 Talhão
          </h1>

          <p className="text-slate-400 mt-2">
            ID: {talhaoId}
          </p>

        </div>

        <Link
          href="/dashboard"
          className="bg-slate-700 hover:bg-slate-800 px-5 py-3 rounded-xl font-bold"
        >
          Voltar
        </Link>

      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">

        <div className="bg-[#16253D] rounded-xl p-6">
          <p className="text-slate-400">🌾 Cultura</p>
          <h2 className="text-2xl font-bold mt-2">
            -
          </h2>
        </div>

        <div className="bg-[#16253D] rounded-xl p-6">
          <p className="text-slate-400">📐 Área</p>
          <h2 className="text-2xl font-bold mt-2">
            -
          </h2>
        </div>

        <div className="bg-[#16253D] rounded-xl p-6">
          <p className="text-slate-400">🚁 Missões</p>
          <h2 className="text-2xl font-bold mt-2">
            0
          </h2>
        </div>

        <div className="bg-[#16253D] rounded-xl p-6">
          <p className="text-slate-400">⭐ Praxis Score</p>
          <h2 className="text-2xl font-bold text-green-400 mt-2">
            Em breve
          </h2>
        </div>

      </div>

      <div className="grid xl:grid-cols-2 gap-6">

        <div className="bg-[#16253D] rounded-xl p-6">

          <h2 className="text-2xl font-bold mb-5">
            🚁 Missões
          </h2>

          <p className="text-slate-400">
            Nenhuma missão cadastrada.
          </p>

        </div>

        <div className="bg-[#16253D] rounded-xl p-6">

          <h2 className="text-2xl font-bold mb-5">
            📈 Mission Score
          </h2>

          <p className="text-slate-400">
            Será calculado após o envio das fotos.
          </p>

        </div>

        <div className="bg-[#16253D] rounded-xl p-6">

          <h2 className="text-2xl font-bold mb-5">
            🤖 IA Praxis
          </h2>

          <p className="text-slate-400">
            Ainda não há análises para este talhão.
          </p>

        </div>

        <div className="bg-[#16253D] rounded-xl p-6">

          <h2 className="text-2xl font-bold mb-5">
            📅 Timeline
          </h2>

          <p className="text-slate-400">
            Nenhum evento registrado.
          </p>

        </div>

      </div>

    </main>
  );
}