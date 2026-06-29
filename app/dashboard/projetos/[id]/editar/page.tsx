"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";

export default function EditarProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const [id, setId] = useState("");
  const [status, setStatus] = useState("Processando");
  const [ndvi, setNdvi] = useState("");
  const [orto, setOrto] = useState("");
  const [webgis, setWebgis] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [cultura, setCultura] = useState("");
const [municipio, setMunicipio] = useState("");
const [uf, setUf] = useState("");

const [gsd, setGsd] = useState("");

const [latitude, setLatitude] = useState("");
const [longitude, setLongitude] = useState("");

const [altoVigor, setAltoVigor] = useState("");
const [medioVigor, setMedioVigor] = useState("");
const [baixoVigor, setBaixoVigor] = useState("");

const [elevacaoMin, setElevacaoMin] = useState("");
const [elevacaoMax, setElevacaoMax] = useState("");
const [piloto, setPiloto] = useState("");
const [drone, setDrone] = useState("");
const [camera, setCamera] = useState("");

const [alturaVoo, setAlturaVoo] = useState("");

const [sobreposicaoFrontal, setSobreposicaoFrontal] = useState("");
const [sobreposicaoLateral, setSobreposicaoLateral] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregar() {
      const { id } = await params;

      setId(id);

      const { data } = await supabase
        .from("projetos")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) return;

      setStatus(data.status || "Processando");
      setNdvi(data.ndvi_url || "");
      setOrto(data.ortomosaico_url || "");
      setWebgis(data.webgis_url || "");
      setObservacoes(data.observacoes || "");
      setCultura(data.cultura || "");
      setMunicipio(data.municipio || "");
      setUf(data.uf || "");

      setGsd(data.gsd?.toString() || "");
      setLatitude(data.latitude?.toString() || "");
      setLongitude(data.longitude?.toString() || "");
      
      setAltoVigor(data.alto_vigor?.toString() || "");
      setMedioVigor(data.medio_vigor?.toString() || "");
      setBaixoVigor(data.baixo_vigor?.toString() || "");
      
      setElevacaoMin(data.elevacao_min?.toString() || "");
      setElevacaoMax(data.elevacao_max?.toString() || "");
      setPiloto(data.piloto || "");
      setDrone(data.drone || "");
      setCamera(data.camera || "");
      
      setAlturaVoo(
        data.altura_voo?.toString() || ""
      );
      setSobreposicaoFrontal(
        data.sobreposicao_frontal?.toString() || ""
      );
      setSobreposicaoLateral(
        data.sobreposicao_lateral?.toString() || ""
      );
    }

    carregar();
  }, [params]);

  async function salvar() {
    setSalvando(true);

    const { error } = await supabase
      .from("projetos")
      .update({
  status,
  ndvi_url: ndvi,
  ortomosaico_url: orto,
  webgis_url: webgis,
  observacoes,

  cultura,
  municipio,
  uf,

  gsd: gsd ? Number(gsd) : null,

  latitude: latitude ? Number(latitude) : null,
  longitude: longitude ? Number(longitude) : null,

  alto_vigor: altoVigor ? Number(altoVigor) : null,
  medio_vigor: medioVigor ? Number(medioVigor) : null,
  baixo_vigor: baixoVigor ? Number(baixoVigor) : null,

  elevacao_min: elevacaoMin ? Number(elevacaoMin) : null,
  elevacao_max: elevacaoMax ? Number(elevacaoMax) : null,

  piloto,
  drone,
  camera,

altura_voo:
  alturaVoo
    ? Number(alturaVoo)
    : null,

sobreposicao_frontal:
  sobreposicaoFrontal
    ? Number(sobreposicaoFrontal)
    : null,

sobreposicao_lateral:
  sobreposicaoLateral
    ? Number(sobreposicaoLateral)
    : null,
})
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Erro ao salvar projeto");
      setSalvando(false);
      return;
    }

    alert("Projeto atualizado com sucesso!");

    router.push(`/dashboard/projetos/${id}`);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        Editar Projeto
      </h1>

      <div className="max-w-5xl space-y-6">

        <div>
          <label className="block mb-2 font-semibold">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          >
            <option value="Processando">
              Processando
            </option>

            <option value="Concluído">
              Concluído
            </option>

            <option value="Entregue">
              Entregue
            </option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            URL NDVI
          </label>

          <input
            type="text"
            value={ndvi}
            onChange={(e) => setNdvi(e.target.value)}
            placeholder="https://..."
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            URL Ortomosaico
          </label>

          <input
            type="text"
            value={orto}
            onChange={(e) => setOrto(e.target.value)}
            placeholder="https://..."
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            URL WebGIS
          </label>

          <input
            type="text"
            value={webgis}
            onChange={(e) => setWebgis(e.target.value)}
            placeholder="https://..."
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          />
        </div>
<div className="grid md:grid-cols-3 gap-4">

  <div>
    <label className="block mb-2 font-semibold">
      Cultura
    </label>

    <input
      value={cultura}
      onChange={(e) => setCultura(e.target.value)}
      className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
    />
  </div>

  <div>
    <label className="block mb-2 font-semibold">
      Município
    </label>

    <input
      value={municipio}
      onChange={(e) => setMunicipio(e.target.value)}
      className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
    />
  </div>

  <div>
    <label className="block mb-2 font-semibold">
      UF
    </label>

    <input
      value={uf}
      onChange={(e) => setUf(e.target.value)}
      className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
    />
  </div>

</div>

<div className="grid md:grid-cols-2 gap-4">

  <div>
    <label className="block mb-2 font-semibold">
      GSD
    </label>

    <input
      value={gsd}
      onChange={(e) => setGsd(e.target.value)}
      className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
    />
  </div>

</div>

<div className="grid md:grid-cols-2 gap-4">

  <div>
    <label className="block mb-2 font-semibold">
      Latitude
    </label>

    <input
      value={latitude}
      onChange={(e) => setLatitude(e.target.value)}
      className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
    />
  </div>

  <div>
    <label className="block mb-2 font-semibold">
      Longitude
    </label>

    <input
      value={longitude}
      onChange={(e) => setLongitude(e.target.value)}
      className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
    />
  </div>

</div>

<div className="grid md:grid-cols-3 gap-4">

  <div>
    <label className="block mb-2 font-semibold">
      Alto Vigor (%)
    </label>

    <input
      value={altoVigor}
      onChange={(e) => setAltoVigor(e.target.value)}
      className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
    />
  </div>

  <div>
    <label className="block mb-2 font-semibold">
      Médio Vigor (%)
    </label>

    <input
      value={medioVigor}
      onChange={(e) => setMedioVigor(e.target.value)}
      className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
    />
  </div>

  <div>
    <label className="block mb-2 font-semibold">
      Baixo Vigor (%)
    </label>

    <input
      value={baixoVigor}
      onChange={(e) => setBaixoVigor(e.target.value)}
      className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
    />
  </div>

</div>

<div className="grid md:grid-cols-2 gap-4">

  <div>
    <label className="block mb-2 font-semibold">
      Elevação Mínima
    </label>

    <input
      value={elevacaoMin}
      onChange={(e) => setElevacaoMin(e.target.value)}
      className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
    />
  </div>

  <div>
    <label className="block mb-2 font-semibold">
      Elevação Máxima
    </label>

    <input
      value={elevacaoMax}
      onChange={(e) => setElevacaoMax(e.target.value)}
      className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
    />
    
  </div>

</div>

        <div>
          <label className="block mb-2 font-semibold">
            Observações Técnicas
          </label>

          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={8}
            placeholder="Descreva aqui as observações do voo, falhas identificadas, áreas críticas, recomendações, etc."
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          />
        </div>

        <div className="flex gap-4 flex-wrap">

          <button
            onClick={salvar}
            disabled={salvando}
            className="bg-green-700 px-6 py-3 rounded-xl font-bold hover:bg-green-800"
          >
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </button>

          <button
            disabled
            className="bg-purple-700 px-6 py-3 rounded-xl font-bold opacity-60 cursor-not-allowed"
          >
            Gerar Relatório IA (em breve)
          </button>

        </div>

      </div>

    </main>
  );
}