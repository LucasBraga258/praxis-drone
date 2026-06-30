"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { criarProjeto } from "../../../../lib/services/projetos";
import { listarFazendas, type Fazenda } from "../../../../lib/services/fazendas";
import { listarTalhoes, type Talhao } from "../../../../lib/services/talhoes";
import { toast } from "sonner";
import Card from "@/app/components/ui/Card";

function NovoProjetoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryFazenda = searchParams.get("fazendaId") || "";
  const queryTalhao = searchParams.get("talhaoId") || "";

  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [talhoes, setTalhoes] = useState<Talhao[]>([]);
  const [fazendaId, setFazendaId] = useState(queryFazenda);
  const [talhaoId, setTalhaoId] = useState(queryTalhao);
  const [dataVoo, setDataVoo] = useState("");
  const [fonteCaptura, setFonteCaptura] = useState("Drone");
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
    if (!fazendaId || !talhaoId || !dataVoo) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setSalvando(true);

    try {
      // Os dados técnicos (Drone, Câmera, Altura) serão preenchidos
      // automaticamente via extração de EXIF no momento do Upload.
      await criarProjeto({
        fazendaId: Number(fazendaId),
        talhaoId: Number(talhaoId),
        dataVoo,
        // @ts-ignore - Aceitando campos vazios para pré-cadastro
        piloto: null, drone: null, camera: null,
        areaMapeada: 0, 
        fonte_captura: fonteCaptura
      });

      toast.success("Missão inicializada com sucesso!");
      router.push("/dashboard/projetos");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar projeto");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-2">Iniciar Nova Missão</h1>
        <p className="text-slate-400 mb-8">Os metadados técnicos (câmera, altura, etc) serão extraídos automaticamente no momento do upload das imagens.</p>

        <Card className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-400 text-sm uppercase font-bold mb-2">Fazenda (Propriedade)</label>
              <select
                value={fazendaId}
                onChange={(e) => setFazendaId(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#0F1C30] border border-slate-700 focus:border-emerald-500 focus:outline-none transition-colors"
              >
                <option value="">Selecione uma fazenda</option>
                {fazendas.map((fazenda) => (
                  <option key={fazenda.id} value={fazenda.id}>{fazenda.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-sm uppercase font-bold mb-2">Talhão de Interesse</label>
              <select
                value={talhaoId}
                onChange={(e) => setTalhaoId(e.target.value)}
                disabled={!fazendaId}
                className="w-full p-3 rounded-xl bg-[#0F1C30] border border-slate-700 disabled:opacity-50 focus:border-emerald-500 focus:outline-none transition-colors"
              >
                <option value="">{fazendaId ? "Selecione um talhão" : "Selecione a fazenda primeiro"}</option>
                {talhoes.map((talhao) => (
                  <option key={talhao.id} value={talhao.id}>{talhao.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-400 text-sm uppercase font-bold mb-2">Data da Captura</label>
              <input
                type="date"
                value={dataVoo}
                onChange={(e) => setDataVoo(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#0F1C30] border border-slate-700 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm uppercase font-bold mb-2">Fonte de Dados</label>
              <select
                value={fonteCaptura}
                onChange={(e) => setFonteCaptura(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#0F1C30] border border-slate-700 focus:border-emerald-500 focus:outline-none transition-colors"
              >
                <option value="Drone">🚁 Voo de Drone (RGB/Multiespectral)</option>
                <option value="Satelite">🛰️ Satélite (Sentinel / Landsat)</option>
                <option value="Sensor">📡 Sensor de Solo (IoT)</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700 flex justify-end gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              onClick={salvarProjeto}
              disabled={salvando}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
            >
              {salvando ? "Criando..." : "Prosseguir para Upload"}
            </button>
          </div>
        </Card>
      </div>
    </main>
  );
}

export default function NovoProjetoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07111F] p-8 text-emerald-500 font-bold">Carregando formulário...</div>}>
      <NovoProjetoForm />
    </Suspense>
  );
}