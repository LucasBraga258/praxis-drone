"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function NovaFazendaPage() {
  const router = useRouter();

  const [clientes, setClientes] = useState<any[]>([]);
  const [agronomos, setAgronomos] = useState<any[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [agronomoId, setAgronomoId] = useState("");

  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [areaHa, setAreaHa] = useState("");

  const [frequenciaMonitoramento, setFrequenciaMonitoramento] =
    useState("20");

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      const { data: clientesData } = await supabase
        .from("clientes")
        .select("*")
        .order("nome");

      const { data: agronomosData } = await supabase
        .from("agronomos")
        .select("*")
        .order("nome");

      setClientes(clientesData || []);
      setAgronomos(agronomosData || []);
    }

    carregarDados();
  }, []);

  async function salvarFazenda() {
    setSalvando(true);

    const { error } = await supabase
      .from("fazendas")
      .insert([
        {
          cliente_id: Number(clienteId),

          agronomo_id: agronomoId
            ? Number(agronomoId)
            : null,

          nome,
          cidade,
          estado,

          area_ha: Number(areaHa),

          frequencia_monitoramento: Number(
            frequenciaMonitoramento
          ),
        },
      ]);

    if (error) {
      console.error(error);
      alert("Erro ao salvar fazenda");
      setSalvando(false);
      return;
    }

    router.push("/dashboard/fazendas");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        Nova Fazenda
      </h1>

      <div className="max-w-2xl space-y-4">

        <div>
          <label className="block mb-2">
            Cliente
          </label>

          <select
            value={clienteId}
            onChange={(e) =>
              setClienteId(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          >
            <option value="">
              Selecione um cliente
            </option>

            {clientes.map((cliente) => (
              <option
                key={cliente.id}
                value={cliente.id}
              >
                {cliente.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">
            Agrônomo Responsável
          </label>

          <select
            value={agronomoId}
            onChange={(e) =>
              setAgronomoId(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          >
            <option value="">
              Nenhum agrônomo vinculado
            </option>

            {agronomos.map((agronomo) => (
              <option
                key={agronomo.id}
                value={agronomo.id}
              >
                {agronomo.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">
            Nome da Fazenda
          </label>

          <input
            value={nome}
            onChange={(e) =>
              setNome(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          />
        </div>

        <div>
          <label className="block mb-2">
            Cidade
          </label>

          <input
            value={cidade}
            onChange={(e) =>
              setCidade(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          />
        </div>

        <div>
          <label className="block mb-2">
            Estado
          </label>

          <input
            value={estado}
            onChange={(e) =>
              setEstado(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          />
        </div>

        <div>
          <label className="block mb-2">
            Área (ha)
          </label>

          <input
            type="number"
            value={areaHa}
            onChange={(e) =>
              setAreaHa(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          />
        </div>

        <div>
          <label className="block mb-2">
            Frequência de Monitoramento
          </label>

          <select
            value={frequenciaMonitoramento}
            onChange={(e) =>
              setFrequenciaMonitoramento(
                e.target.value
              )
            }
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          >
            <option value="15">
              A cada 15 dias
            </option>

            <option value="20">
              A cada 20 dias
            </option>

            <option value="30">
              Mensal (30 dias)
            </option>

            <option value="45">
              A cada 45 dias
            </option>

            <option value="60">
              A cada 60 dias
            </option>
          </select>
        </div>

        <button
          onClick={salvarFazenda}
          disabled={salvando}
          className="bg-[#1E5D2D] px-6 py-3 rounded-xl font-bold"
        >
          {salvando
            ? "Salvando..."
            : "Salvar Fazenda"}
        </button>

      </div>

    </main>
  );
}