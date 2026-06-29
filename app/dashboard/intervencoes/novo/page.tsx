"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function NovaIntervencaoPage() {
  const router = useRouter();

  const [fazendas, setFazendas] = useState<any[]>([]);
  const [pragas, setPragas] = useState<any[]>([]);

  const [fazendaId, setFazendaId] = useState("");
  const [pragaId, setPragaId] = useState("");
  const [dataIntervencao, setDataIntervencao] = useState("");
  const [tipo, setTipo] = useState("");
  const [produto, setProduto] = useState("");
  const [praga, setPraga] = useState("");
const [areaAplicada, setAreaAplicada] = useState("");
const [custo, setCusto] = useState("");
const [empresaId, setEmpresaId] = useState("");
const [empresas, setEmpresas] = useState<any[]>([]);
  const [dose, setDose] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("fazendas")
        .select("*")
        .order("nome");

      setFazendas(data || []);

      const { data: pragasData } = await supabase
  .from("pragas")
  .select("*")
  .order("nome");

setPragas(pragasData || []);

      const { data: empresasData } =
  await supabase
    .from("empresas_parceiras")
    .select("*")
    .order("nome");

setEmpresas(empresasData || []);
    }

    carregar();
  }, []);

  async function salvar() {
    const { error } = await supabase
      .from("intervencoes")
      .insert({
  fazenda_id: Number(fazendaId),
  praga_id: pragaId
  ? Number(pragaId)
  : null,

  data_intervencao: dataIntervencao,

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
});
    if (error) {
      alert(error.message);
      return;
    }

    alert("Intervenção cadastrada");

    router.push("/dashboard/fazendas");
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        Nova Intervenção
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

        <select
  value={pragaId}
  onChange={(e) =>
    setPragaId(e.target.value)
  }
  className="w-full p-3 rounded-xl bg-[#16253D]"
>

  <option value="">
    Selecione a Praga
  </option>

  {pragas
    .filter(
      (p) =>
        !fazendaId ||
        p.fazenda_id == fazendaId
    )
    .map((praga) => (

      <option
        key={praga.id}
        value={praga.id}
      >
        {praga.nome}
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
  placeholder="Praga encontrada"
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
  placeholder="Área aplicada (ha)"
  className="w-full p-3 rounded-xl bg-[#16253D]"
/>
<input
  type="number"
  value={custo}
  onChange={(e) =>
    setCusto(e.target.value)
  }
  placeholder="Custo da aplicação"
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
    Selecione a empresa executora
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
          className="bg-green-700 px-6 py-3 rounded-xl font-bold"
        >
          Salvar
        </button>

      </div>

    </main>
  );
}