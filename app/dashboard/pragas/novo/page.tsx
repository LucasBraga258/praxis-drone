"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NovaPragaPage() {
  const supabase = createClient();

  const router = useRouter();

  const [fazendas, setFazendas] =
    useState<any[]>([]);

  const [fazendaId, setFazendaId] =
    useState("");

  const [nome, setNome] =
    useState("");

  const [nivel, setNivel] =
    useState("Baixo");

  const [status, setStatus] =
    useState("Em Monitoramento");

  const [data, setData] =
    useState("");

  const [observacoes, setObservacoes] =
    useState("");

  useEffect(() => {

    async function carregar() {

      const { data } =
        await supabase
          .from("fazendas")
          .select("*")
          .order("nome");

      setFazendas(data || []);
    }

    carregar();

  }, []);

  async function salvar() {

    const { error } =
      await supabase
        .from("pragas")
        .insert({
          fazenda_id:
            Number(fazendaId),

          nome,

          nivel_infestacao:
            nivel,

          status,

          data_identificacao:
            data,

          observacoes,
        });

    if (error) {
      alert(error.message);
      return;
    }

    router.push(
      "/dashboard/pragas"
    );

    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        Nova Praga
      </h1>

      <div className="max-w-2xl space-y-4">

        <select
          value={fazendaId}
          onChange={(e) =>
            setFazendaId(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#16253D]"
        >
          <option value="">
            Selecione a Fazenda
          </option>

          {fazendas.map((fazenda) => (

            <option
              key={fazenda.id}
              value={fazenda.id}
            >
              {fazenda.nome}
            </option>

          ))}
        </select>

        <input
          value={nome}
          onChange={(e) =>
            setNome(e.target.value)
          }
          placeholder="Nome da Praga"
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <input
          type="date"
          value={data}
          onChange={(e) =>
            setData(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <select
          value={nivel}
          onChange={(e) =>
            setNivel(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#16253D]"
        >
          <option>Baixo</option>
          <option>Médio</option>
          <option>Alto</option>
        </select>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#16253D]"
        >
          <option>
            Em Monitoramento
          </option>

          <option>
            Tratada
          </option>

          <option>
            Resolvida
          </option>

        </select>

        <textarea
          value={observacoes}
          onChange={(e) =>
            setObservacoes(
              e.target.value
            )
          }
          placeholder="Observações"
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <button
          onClick={salvar}
          className="
            bg-green-700
            px-6
            py-3
            rounded-xl
            font-bold
          "
        >
          Salvar
        </button>

      </div>

    </main>
  );
}