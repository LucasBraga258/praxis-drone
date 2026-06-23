"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function NovoProjetoPage() {
  const router = useRouter();

  const [fazendas, setFazendas] = useState<any[]>([]);
  const [fazendaId, setFazendaId] = useState("");
  const [dataVoo, setDataVoo] = useState("");
  const [areaMapeada, setAreaMapeada] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarFazendas() {
      const { data } = await supabase
        .from("fazendas")
        .select("*")
        .order("nome");

      setFazendas(data || []);
    }

    carregarFazendas();
  }, []);

  async function salvarProjeto() {
    setSalvando(true);

    const ano = new Date().getFullYear();

    const { count } = await supabase
      .from("projetos")
      .select("*", {
        count: "exact",
        head: true,
      });

    const sequencia = String(
      (count || 0) + 1
    ).padStart(3, "0");

    const codigo = `${ano}-${sequencia}`;

    const fazendaSelecionada = fazendas.find(
      (f) => f.id === Number(fazendaId)
    );

    const { error } = await supabase
      .from("projetos")
      .insert([
        {
          fazenda_id: Number(fazendaId),
          codigo,
          data_voo: dataVoo,
          area_mapeada: Number(areaMapeada),
          status: "Processando",
        },
      ]);

    if (error) {
      console.error(error);
      alert("Erro ao salvar projeto");
      setSalvando(false);
      return;
    }

    // Atualiza automaticamente o próximo voo

    if (
      fazendaSelecionada?.frequencia_monitoramento
    ) {
      const proximoVoo = new Date(dataVoo);

      proximoVoo.setDate(
        proximoVoo.getDate() +
          fazendaSelecionada.frequencia_monitoramento
      );

      await supabase
        .from("fazendas")
        .update({
          proximo_voo:
            proximoVoo
              .toISOString()
              .split("T")[0],
        })
        .eq("id", Number(fazendaId));
    }

    router.push("/dashboard/projetos");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        Novo Projeto
      </h1>

      <div className="max-w-2xl space-y-4">

        <div>
          <label className="block mb-2">
            Fazenda
          </label>

          <select
            value={fazendaId}
            onChange={(e) =>
              setFazendaId(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          >
            <option value="">
              Selecione uma fazenda
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
        </div>

        <div>
          <label className="block mb-2">
            Data do voo
          </label>

          <input
            type="date"
            value={dataVoo}
            onChange={(e) =>
              setDataVoo(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          />
        </div>

        <div>
          <label className="block mb-2">
            Área Mapeada (ha)
          </label>

          <input
            type="number"
            value={areaMapeada}
            onChange={(e) =>
              setAreaMapeada(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          />
        </div>

        <button
          onClick={salvarProjeto}
          disabled={salvando}
          className="bg-[#1E5D2D] px-6 py-3 rounded-xl font-bold"
        >
          {salvando
            ? "Salvando..."
            : "Salvar Projeto"}
        </button>

      </div>

    </main>
  );
}