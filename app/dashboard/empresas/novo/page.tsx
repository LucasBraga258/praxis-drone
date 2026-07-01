"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NovaEmpresaPage() {
  const supabase = createClient();

  const router = useRouter();

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("Drone");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [salvando, setSalvando] =
    useState(false);

  async function salvar() {

    setSalvando(true);

    const { error } = await supabase
      .from("empresas_parceiras")
      .insert([
        {
          nome,
          tipo,
          telefone,
          email,
          cidade,
          estado,
        },
      ]);

    if (error) {

      console.error(error);

      alert(
        "Erro ao salvar empresa"
      );

      setSalvando(false);

      return;
    }

    router.push(
      "/dashboard/empresas"
    );

    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        Nova Empresa Parceira
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
          placeholder="Telefone"
          value={telefone}
          onChange={(e) =>
            setTelefone(e.target.value)
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
          placeholder="Cidade"
          value={cidade}
          onChange={(e) =>
            setCidade(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <input
          placeholder="Estado"
          value={estado}
          onChange={(e) =>
            setEstado(e.target.value)
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
            : "Salvar Empresa"}
        </button>

      </div>

    </main>
  );
}