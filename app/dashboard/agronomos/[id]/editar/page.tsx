"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";

export default function EditarAgronomoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = use(params);

  const router = useRouter();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [crea, setCrea] = useState("");

  const [salvando, setSalvando] =
    useState(false);

  useEffect(() => {

    async function carregar() {

      const { data } = await supabase
        .from("agronomos")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) return;

      setNome(data.nome || "");
      setTelefone(data.telefone || "");
      setEmail(data.email || "");
      setCrea(data.crea || "");
    }

    carregar();

  }, [id]);

  async function salvar() {

    setSalvando(true);

    const { error } = await supabase
      .from("agronomos")
      .update({
        nome,
        telefone,
        email,
        crea,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(
      `/dashboard/agronomos/${id}`
    );

    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <div className="flex gap-3 mb-8">

        <Link
          href={`/dashboard/agronomos/${id}`}
          className="bg-[#16253D] px-4 py-2 rounded-xl"
        >
          ← Voltar
        </Link>

      </div>

      <h1 className="text-4xl font-bold mb-8">
        Editar Agrônomo
      </h1>

      <div className="max-w-2xl space-y-4">

        <input
          value={nome}
          onChange={(e) =>
            setNome(e.target.value)
          }
          placeholder="Nome"
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <input
          value={crea}
          onChange={(e) =>
            setCrea(e.target.value)
          }
          placeholder="CREA"
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <input
          value={telefone}
          onChange={(e) =>
            setTelefone(e.target.value)
          }
          placeholder="Telefone"
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <input
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          placeholder="Email"
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <button
          onClick={salvar}
          disabled={salvando}
          className="
            bg-green-700
            px-6
            py-3
            rounded-xl
            font-bold
          "
        >
          {salvando
            ? "Salvando..."
            : "Salvar"}
        </button>

      </div>

    </main>
  );
}