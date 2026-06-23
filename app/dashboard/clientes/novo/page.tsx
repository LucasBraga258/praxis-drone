"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function NovoClientePage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvarCliente() {
    setSalvando(true);

    const { error } = await supabase
      .from("clientes")
      .insert([
        {
          nome,
          email,
        },
      ]);

    if (error) {
      alert("Erro ao salvar cliente");
      console.error(error);
      setSalvando(false);
      return;
    }

    router.push("/dashboard/clientes");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        Novo Cliente
      </h1>

      <div className="max-w-xl space-y-4">

        <div>
          <label className="block mb-2">
            Nome
          </label>

          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          />
        </div>

        <div>
          <label className="block mb-2">
            E-mail
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          />
        </div>

        <button
          onClick={salvarCliente}
          disabled={salvando}
          className="bg-[#1E5D2D] px-6 py-3 rounded-xl font-bold"
        >
          {salvando ? "Salvando..." : "Salvar Cliente"}
        </button>

      </div>

    </main>
  );
}