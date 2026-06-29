"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { criarProjeto } from "../../../../lib/services/projetos";
import {
  listarFazendas,
  type Fazenda,
} from "../../../../lib/services/fazendas";
import {
  listarTalhoes,
  type Talhao,
} from "../../../../lib/services/talhoes";

export default function NovoProjetoPage() {
  const router = useRouter();

  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [talhoes, setTalhoes] = useState<Talhao[]>([]);
  const [fazendaId, setFazendaId] = useState("");
  const [talhaoId, setTalhaoId] = useState("");
  const [dataVoo, setDataVoo] = useState("");
  const [areaMapeada, setAreaMapeada] = useState("");
  const [piloto, setPiloto] = useState("");
  const [drone, setDrone] = useState("");
  const [camera, setCamera] = useState("");
  const [alturaVoo, setAlturaVoo] = useState("");
  const [sobreposicaoFrontal, setSobreposicaoFrontal] = useState("");
  const [sobreposicaoLateral, setSobreposicaoLateral] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarFazendas() {
      const data = await listarFazendas();
      setFazendas(data);
    }

    carregarFazendas();
  }, []);

  useEffect(() => {
    async function carregarTalhoes() {
      if (!fazendaId) {
        setTalhoes([]);
        return;
      }

      const data = await listarTalhoes(Number(fazendaId));
      setTalhoes(data);
    }

    setTalhaoId("");
    carregarTalhoes();
  }, [fazendaId]);

  async function salvarProjeto() {
    if (!fazendaId) {
      alert("Selecione a fazenda do projeto.");
      return;
    }

    if (!talhaoId) {
      alert("Selecione o talhão do projeto.");
      return;
    }

    setSalvando(true);

    try {
      await criarProjeto({
        fazendaId: Number(fazendaId),
        talhaoId: Number(talhaoId),
        dataVoo,
        areaMapeada: Number(areaMapeada),
        piloto,
        drone,
        camera,
        alturaVoo: alturaVoo
          ? Number(alturaVoo)
          : null,
        sobreposicaoFrontal: sobreposicaoFrontal
          ? Number(sobreposicaoFrontal)
          : null,
        sobreposicaoLateral: sobreposicaoLateral
          ? Number(sobreposicaoLateral)
          : null,
      });

      router.push("/dashboard/projetos");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar projeto");
    } finally {
      setSalvando(false);
    }
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
            Talhão
          </label>

          <select
            value={talhaoId}
            onChange={(e) =>
              setTalhaoId(e.target.value)
            }
            disabled={!fazendaId}
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          >
            <option value="">
              {fazendaId
                ? "Selecione um talhão"
                : "Selecione uma fazenda primeiro"}
            </option>

            {talhoes.map((talhao) => (
              <option
                key={talhao.id}
                value={talhao.id}
              >
                {talhao.nome}
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

        <div>
          <label className="block mb-2">
            Piloto
          </label>

          <input
            value={piloto}
            onChange={(e) =>
              setPiloto(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          />
        </div>

        <div>
          <label className="block mb-2">
            Drone
          </label>

          <select
            value={drone}
            onChange={(e) =>
              setDrone(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          >
            <option value="">Selecione</option>
            <option>Mavic 3 Multispectral</option>
            <option>Mavic 3 Enterprise</option>
            <option>Phantom 4 RTK</option>
            <option>Matrice 350 RTK</option>
            <option>Outro</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">
            Câmera
          </label>

          <select
            value={camera}
            onChange={(e) =>
              setCamera(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          >
            <option value="">Selecione</option>
            <option>RGB</option>
            <option>RGB + Multispectral</option>
            <option>Termal</option>
            <option>LiDAR</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">
            Altura do voo (m)
          </label>

          <input
            type="number"
            value={alturaVoo}
            onChange={(e) =>
              setAlturaVoo(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          />
        </div>

        <div>
          <label className="block mb-2">
            Sobreposição Frontal (%)
          </label>

          <input
            type="number"
            value={sobreposicaoFrontal}
            onChange={(e) =>
              setSobreposicaoFrontal(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-[#16253D] border border-slate-600"
          />
        </div>

        <div>
          <label className="block mb-2">
            Sobreposição Lateral (%)
          </label>

          <input
            type="number"
            value={sobreposicaoLateral}
            onChange={(e) =>
              setSobreposicaoLateral(e.target.value)
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