"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NovoAgronomoPage() {
  const supabase = createClient();

  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [crea, setCrea] = useState("");

  const [salvando, setSalvando] =
    useState(false);

  async function salvar() {

    setSalvando(true);

    const { error } = await supabase
      .from("agronomos")
      .insert([
        {
          nome,
          email,
          telefone,
          crea,
        },
      ]);

    if (error) {

      console.error(error);

      alert(
        "Erro ao salvar agrônomo"
      );

      setSalvando(false);

      return;
    }

    router.push(
      "/dashboard/agronomos"
    );

    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        Novo Agrônomo
      </h1>

      <div className="max-w-2xl space-y-4">

        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) =>
            setNome(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <input
          placeholder="E-mail"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <input
          placeholder="Telefone"
          value={telefone}
          onChange={(e) =>
            setTelefone(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <input
          placeholder="CREA"
          value={crea}
          onChange={(e) =>
            setCrea(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <button
          onClick={salvar}
          disabled={salvando}
          className="bg-[#1E5D2D] px-6 py-3 rounded-xl font-bold"
        >
          {salvando
            ? "Salvando..."
            : "Salvar Agrônomo"}
        </button>

      </div>

    </main>
  );
}