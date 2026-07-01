"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { TreesIcon } from "lucide-react";

export default function NovoTalhaoPage() {
  const supabase = createClient();
  const router = useRouter();

  const [fazendas, setFazendas] = useState<any[]>([]);
  const [fazendaId, setFazendaId] = useState("");
  const [nome, setNome] = useState("");
  const [cultura, setCultura] = useState("");
  const [areaHectares, setAreaHectares] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarFazendas() {
      const { data } = await supabase.from("fazendas").select("*").order("nome");
      if (data) setFazendas(data);
    }
    carregarFazendas();
  }, []);

  async function salvarTalhao(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    if (!fazendaId) {
      toast.error("Por favor, selecione uma fazenda.");
      setSalvando(false);
      return;
    }

    const { error } = await supabase.from("talhoes").insert([
      {
        fazenda_id: fazendaId,
        nome,
        cultura,
        area_hectares: areaHectares ? parseFloat(areaHectares) : null,
      },
    ]);

    if (error) {
      toast.error(`Erro ao salvar talhão: ${error.message}`);
      setSalvando(false);
      return;
    }

    toast.success("Talhão criado com sucesso!");
    router.push("/dashboard/talhoes");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <TreesIcon className="w-8 h-8 text-[#26D367]" /> Novo Talhão
        </h1>

        <form onSubmit={salvarTalhao} className="space-y-6 bg-[#16253D] p-8 rounded-2xl">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Fazenda Pertencente
            </label>
            <select
              required
              className="w-full bg-[#0B1727] border border-slate-700 rounded-lg p-3 text-white"
              value={fazendaId}
              onChange={(e) => setFazendaId(e.target.value)}
            >
              <option value="">-- Selecione uma Fazenda --</option>
              {fazendas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Nome ou Número do Talhão
            </label>
            <input
              required
              type="text"
              className="w-full bg-[#0B1727] border border-slate-700 rounded-lg p-3 text-white"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Talhão 01 - Norte"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">
                Cultura Principal
              </label>
              <input
                type="text"
                className="w-full bg-[#0B1727] border border-slate-700 rounded-lg p-3 text-white"
                value={cultura}
                onChange={(e) => setCultura(e.target.value)}
                placeholder="Ex: Soja, Milho, Cana"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">
                Área Estimada (Hectares)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full bg-[#0B1727] border border-slate-700 rounded-lg p-3 text-white"
                value={areaHectares}
                onChange={(e) => setAreaHectares(e.target.value)}
                placeholder="Ex: 150.5"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={salvando}
            className="w-full bg-[#1E5D2D] text-white rounded-lg py-4 font-bold hover:bg-[#26D367] transition disabled:opacity-50 mt-4"
          >
            {salvando ? "Salvando..." : "Salvar Talhão"}
          </button>
        </form>
      </div>
    </main>
  );
}
