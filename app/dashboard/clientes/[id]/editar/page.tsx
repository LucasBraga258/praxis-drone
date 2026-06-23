"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";

export default function EditarClientePage({
  params,
}: {
  params: {
    id: string;
  };
}) {

  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  const [salvando, setSalvando] =
    useState(false);

  useEffect(() => {

    async function carregar() {

      const { data } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!data) return;

      setNome(data.nome || "");
      setEmail(data.email || "");
    }

    carregar();

  }, [params.id]);

  async function salvar() {

    setSalvando(true);

    const { error } = await supabase
      .from("clientes")
      .update({
        nome,
        email,
      })
      .eq("id", params.id);

    if (error) {

      alert("Erro ao salvar");

      setSalvando(false);

      return;
    }

    router.push(
      `/dashboard/clientes/${params.id}`
    );

    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        Editar Cliente
      </h1>

      <div className="max-w-2xl space-y-4">

        <div>

          <label className="block mb-2">
            Nome
          </label>

          <input
            value={nome}
            onChange={(e) =>
              setNome(e.target.value)
            }
            className="
              w-full
              p-3
              rounded-xl
              bg-[#16253D]
            "
          />

        </div>

        <div>

          <label className="block mb-2">
            E-mail
          </label>

          <input
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="
              w-full
              p-3
              rounded-xl
              bg-[#16253D]
            "
          />

        </div>

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