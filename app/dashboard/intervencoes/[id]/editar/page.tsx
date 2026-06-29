"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";

export default function EditarIntervencaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = use(params);

  const router = useRouter();

  const [fazendas, setFazendas] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);

  const [fazendaId, setFazendaId] = useState("");
  const [dataIntervencao, setDataIntervencao] = useState("");
  const [tipo, setTipo] = useState("");
  const [praga, setPraga] = useState("");
  const [produto, setProduto] = useState("");
  const [dose, setDose] = useState("");
  const [areaAplicada, setAreaAplicada] = useState("");
  const [custo, setCusto] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [salvando, setSalvando] =
    useState(false);

  useEffect(() => {

    async function carregar() {

      const { data } = await supabase
        .from("intervencoes")
        .select("*")
        .eq("id", id)
        .single();

      const { data: fazendasData } =
        await supabase
          .from("fazendas")
          .select("*")
          .order("nome");

      const { data: empresasData } =
        await supabase
          .from("empresas_parceiras")
          .select("*")
          .order("nome");

      setFazendas(fazendasData || []);
      setEmpresas(empresasData || []);

      if (!data) return;

      setFazendaId(
        String(data.fazenda_id || "")
      );

      setDataIntervencao(
        data.data_intervencao || ""
      );

      setTipo(data.tipo || "");
      setPraga(data.praga || "");
      setProduto(data.produto || "");
      setDose(data.dose || "");

      setAreaAplicada(
        String(data.area_aplicada || "")
      );

      setCusto(
        String(data.custo || "")
      );

      setEmpresaId(
        String(data.empresa_id || "")
      );

      setResponsavel(
        data.responsavel || ""
      );

      setObservacoes(
        data.observacoes || ""
      );
    }

    carregar();

  }, [id]);

  async function salvar() {

    setSalvando(true);

    const { error } = await supabase
      .from("intervencoes")
      .update({
        fazenda_id:
          Number(fazendaId),

        data_intervencao:
          dataIntervencao,

        tipo,
        praga,
        produto,
        dose,

        area_aplicada:
          areaAplicada
            ? Number(areaAplicada)
            : null,

        custo:
          custo
            ? Number(custo)
            : null,

        empresa_id:
          empresaId
            ? Number(empresaId)
            : null,

        responsavel,
        observacoes,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(
      "/dashboard/intervencoes"
    );

    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <div className="flex gap-3 mb-8">

        <Link
          href="/dashboard/intervencoes"
          className="bg-[#16253D] px-4 py-2 rounded-xl"
        >
          ← Voltar
        </Link>

      </div>

      <h1 className="text-4xl font-bold mb-8">
        Editar Intervenção
      </h1>

      <div className="max-w-2xl space-y-4">

        <select
          value={fazendaId}
          onChange={(e) =>
            setFazendaId(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#16253D]"
        >
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
          type="date"
          value={dataIntervencao}
          onChange={(e) =>
            setDataIntervencao(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <input
          value={tipo}
          onChange={(e) =>
            setTipo(e.target.value)
          }
          placeholder="Tipo"
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <input
          value={praga}
          onChange={(e) =>
            setPraga(e.target.value)
          }
          placeholder="Praga"
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <input
          value={produto}
          onChange={(e) =>
            setProduto(e.target.value)
          }
          placeholder="Produto"
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <input
          value={dose}
          onChange={(e) =>
            setDose(e.target.value)
          }
          placeholder="Dose"
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <input
          value={areaAplicada}
          onChange={(e) =>
            setAreaAplicada(e.target.value)
          }
          placeholder="Área Aplicada"
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <input
          value={custo}
          onChange={(e) =>
            setCusto(e.target.value)
          }
          placeholder="Custo"
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <select
          value={empresaId}
          onChange={(e) =>
            setEmpresaId(e.target.value)
          }
          className="w-full p-3 rounded-xl bg-[#16253D]"
        >
          <option value="">
            Selecione uma empresa
          </option>

          {empresas.map((empresa) => (
            <option
              key={empresa.id}
              value={empresa.id}
            >
              {empresa.nome}
            </option>
          ))}
        </select>

        <input
          value={responsavel}
          onChange={(e) =>
            setResponsavel(e.target.value)
          }
          placeholder="Responsável"
          className="w-full p-3 rounded-xl bg-[#16253D]"
        />

        <textarea
          value={observacoes}
          onChange={(e) =>
            setObservacoes(e.target.value)
          }
          placeholder="Observações"
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