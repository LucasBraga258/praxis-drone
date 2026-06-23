"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";

export default function EditarFazendaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
const { id } = use(params);
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [areaHa, setAreaHa] = useState("");
  const [clienteId, setClienteId] = useState("");
const [agronomoId, setAgronomoId] = useState("");
const [empresaId, setEmpresaId] = useState("");
const [cultura, setCultura] = useState("");
const [frequencia, setFrequencia] = useState("");

  const [salvando, setSalvando] =
    useState(false);
const [clientes, setClientes] = useState<any[]>([]);
const [agronomos, setAgronomos] = useState<any[]>([]);
const [empresas, setEmpresas] = useState<any[]>([]);
  useEffect(() => {

    async function carregar() {

      const { data } = await supabase
        .from("fazendas")
        .select("*")
        .eq("id", id)
        .single();

        console.log("ID:", id);
console.log("DATA:", data);

const { data: clientesData } =
  await supabase
    .from("clientes")
    .select("*")
    .order("nome");

const { data: agronomosData } =
  await supabase
    .from("agronomos")
    .select("*")
    .order("nome");

const { data: empresasData } =
  await supabase
    .from("empresas_parceiras")
    .select("*")
    .order("nome");

setClientes(clientesData || []);
setAgronomos(agronomosData || []);
setEmpresas(empresasData || []);
      if (!data) return;

      setNome(data.nome || "");
      setCidade(data.cidade || "");
      setEstado(data.estado || "");
      setAreaHa(
        String(data.area_ha || "")
      );
      setClienteId(
  String(data.cliente_id || "")
);

setAgronomoId(
  String(data.agronomo_id || "")
);

setEmpresaId(
  String(data.empresa_parceira_id || "")
);

setCultura(
  data.cultura || ""
);

setFrequencia(
  String(
    data.frequencia_monitoramento || ""
  )
);
    }

    carregar();

  }, [id]);

  async function salvar() {

    setSalvando(true);

    const { error } = await supabase
      .from("fazendas")
      .update({
  nome,
  cidade,
  estado,

  area_ha: Number(areaHa),
  

  cliente_id:
    clienteId
      ? Number(clienteId)
      : null,

  agronomo_id:
    agronomoId
      ? Number(agronomoId)
      : null,
      

  empresa_parceira_id:
    empresaId
      ? Number(empresaId)
      : null,

  cultura,

  frequencia_monitoramento:
    frequencia
      ? Number(frequencia)
      : null,
})
      .eq("id", id);

    if (error) {

      alert(error.message);

      setSalvando(false);

      return;
    }

    router.push(
      `/dashboard/fazendas/${id}`
    );

    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        Editar Fazenda
      </h1>

     <div className="max-w-2xl space-y-4">

  <input
    value={nome}
    onChange={(e) => setNome(e.target.value)}
    className="w-full p-3 rounded-xl bg-[#16253D]"
  />

  <input
    value={cidade}
    onChange={(e) => setCidade(e.target.value)}
    className="w-full p-3 rounded-xl bg-[#16253D]"
  />

  <input
    value={estado}
    onChange={(e) => setEstado(e.target.value)}
    className="w-full p-3 rounded-xl bg-[#16253D]"
  />

  <input
    type="number"
    value={areaHa}
    onChange={(e) => setAreaHa(e.target.value)}
    className="w-full p-3 rounded-xl bg-[#16253D]"
  />

  {/* CLIENTE */}

  <select
    value={clienteId}
    onChange={(e) => setClienteId(e.target.value)}
    className="w-full p-3 rounded-xl bg-[#16253D]"
  >
    <option value="">Selecione um cliente</option>

    {clientes.map((cliente) => (
      <option
        key={cliente.id}
        value={cliente.id}
      >
        {cliente.nome}
      </option>
    ))}
  </select>

  {/* AGRÔNOMO */}

  <select
    value={agronomoId}
    onChange={(e) => setAgronomoId(e.target.value)}
    className="w-full p-3 rounded-xl bg-[#16253D]"
  >
    <option value="">Selecione um agrônomo</option>

    {agronomos.map((agronomo) => (
      <option
        key={agronomo.id}
        value={agronomo.id}
      >
        {agronomo.nome}
      </option>
    ))}
  </select>

  {/* EMPRESA */}

  <select
    value={empresaId}
    onChange={(e) => setEmpresaId(e.target.value)}
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
    Salvar
  </button>

</div>
    </main>
  );
}