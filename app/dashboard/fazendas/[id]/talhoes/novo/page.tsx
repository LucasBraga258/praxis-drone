"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

import { criarTalhao } from "@/lib/services/talhoes";

export default function NovoTalhaoPage() {

  const router = useRouter();

  const params = useParams();

  const fazendaId = Number(params.id);

  const [salvando, setSalvando] =
    useState(false);

  const [nome, setNome] =
    useState("");

  const [cultura, setCultura] =
    useState("");

  const [variedade, setVariedade] =
    useState("");

  const [safra, setSafra] =
    useState("");

  const [area, setArea] =
    useState("");

  const [observacoes, setObservacoes] =
    useState("");

  async function salvar() {

    if (!nome.trim()) {

      toast.warning(
        "Informe o nome do talhão."
      );

      return;

    }

    try {

      setSalvando(true);

      await criarTalhao({

        fazenda_id: fazendaId,

        nome,

        cultura,

        variedade,

        safra,

        area: area
          ? Number(area)
          : undefined,

        observacoes,

      });

      toast.success(
        "Talhão criado com sucesso!"
      );

      router.push(
        `/dashboard/fazendas/${fazendaId}/talhoes`
      );

      router.refresh();

    } catch (error: any) {

      console.error(error);

      toast.error(
        error.message ??
        "Erro ao criar talhão."
      );

    } finally {

      setSalvando(false);

    }

  }

  return (

    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-8">

        🌱 Novo Talhão

      </h1>

      <div className="max-w-2xl space-y-5">

        <div>

          <label className="block mb-2">

            Nome

          </label>

          <input
            value={nome}
            onChange={(e)=>
              setNome(e.target.value)
            }
            className="w-full rounded-xl p-3 bg-[#16253D] border border-slate-600"
          />

        </div>

        <div>

          <label className="block mb-2">

            Cultura

          </label>

          <input
            value={cultura}
            onChange={(e)=>
              setCultura(e.target.value)
            }
            className="w-full rounded-xl p-3 bg-[#16253D] border border-slate-600"
          />

        </div>

        <div>

          <label className="block mb-2">

            Variedade

          </label>

          <input
            value={variedade}
            onChange={(e)=>
              setVariedade(e.target.value)
            }
            className="w-full rounded-xl p-3 bg-[#16253D] border border-slate-600"
          />

        </div>

        <div>

          <label className="block mb-2">

            Safra

          </label>

          <input
            value={safra}
            onChange={(e)=>
              setSafra(e.target.value)
            }
            placeholder="Ex: 2026/2027"
            className="w-full rounded-xl p-3 bg-[#16253D] border border-slate-600"
          />

        </div>

        <div>

          <label className="block mb-2">

            Área (ha)

          </label>

          <input
            type="number"
            value={area}
            onChange={(e)=>
              setArea(e.target.value)
            }
            className="w-full rounded-xl p-3 bg-[#16253D] border border-slate-600"
          />

        </div>

        <div>

          <label className="block mb-2">

            Observações

          </label>

          <textarea
            rows={4}
            value={observacoes}
            onChange={(e)=>
              setObservacoes(e.target.value)
            }
            className="w-full rounded-xl p-3 bg-[#16253D] border border-slate-600"
          />

        </div>

        <button
          onClick={salvar}
          disabled={salvando}
          className="bg-green-700 hover:bg-green-800 px-6 py-3 rounded-xl font-bold"
        >

          {salvando
            ? "Salvando..."
            : "Salvar Talhão"}

        </button>

      </div>

    </main>

  );

}