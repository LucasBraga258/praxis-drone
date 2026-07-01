"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditarEmpresaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = createClient();

  const { id } = use(params);

  const router = useRouter();

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [salvando, setSalvando] =
    useState(false);

  useEffect(() => {

    async function carregar() {

      const { data } = await supabase
        .from("empresas_parceiras")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) return;

      setNome(data.nome || "");
      setTipo(data.tipo || "");
      setTelefone(data.telefone || "");
      setEmail(data.email || "");
      setCidade(data.cidade || "");
      setEstado(data.estado || "");
    }

    carregar();

  }, [id]);

  async function salvar() {

    setSalvando(true);

    const { error } = await supabase
      .from("empresas_parceiras")
      .update({
        nome,
        tipo,
        telefone,
        email,
        cidade,
        estado,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(
      `/dashboard/empresas/${id}`
    );

    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <div className="flex gap-3 mb-8">

        <Link
          href={`/dashboard/empresas/${id}`}
          className="bg-[#16253D] px-4 py-2 rounded-xl"
        >
          ← Voltar
        </Link>

      </div>

      <h1 className="text-4xl font-bold mb-8">
        Editar Empresa
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

        <select
          value={tipo}
          onChange={(e) =>
            setTipo(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#16253D]"
        >
          <option>Drone</option>
          <option>Pulverização</option>
          <option>Laboratório</option>
          <option>Consultoria Agronômica</option>
          <option>Energia Solar</option>
          <option>Irrigação</option>
        </select>

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
          placeholder="E-mail"
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <input
          value={cidade}
          onChange={(e) =>
            setCidade(e.target.value)
          }
          placeholder="Cidade"
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <input
          value={estado}
          onChange={(e) =>
            setEstado(e.target.value)
          }
          placeholder="Estado"
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