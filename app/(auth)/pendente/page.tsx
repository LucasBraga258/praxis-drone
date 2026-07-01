"use client";

import { LeafIcon, ClockIcon } from "lucide-react";
import Link from "next/link";

export default function PendentePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1726] text-white py-12">
      <div className="w-full max-w-md bg-[#16253D] p-8 rounded-2xl shadow-2xl border border-slate-800 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-amber-500/20 p-4 rounded-full border border-amber-500/50">
            <ClockIcon className="w-12 h-12 text-amber-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">Aguardando Aprovação</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Seu cadastro foi recebido com sucesso! Nossa equipe de administração está analisando seus dados. 
          Você receberá um aviso assim que o seu acesso for liberado.
        </p>

        <Link
          href="/login"
          className="inline-block bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-8 rounded-lg transition-colors border border-slate-700"
        >
          Voltar para o Login
        </Link>
      </div>
    </div>
  );
}
