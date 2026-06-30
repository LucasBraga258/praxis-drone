"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";
import Card from "@/app/components/ui/Card";
import { toast } from "sonner";

export default function PragaEditarPage() {
  const params = useParams();
  const router = useRouter();
  const pragaId = params.id as string;

  const [nome, setNome] = useState("");
  const [nivel, setNivel] = useState("Médio");
  const [status, setStatus] = useState("Em Monitoramento");
  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.from("pragas").select("*").eq("id", pragaId).single();
      if (data) {
        setNome(data.nome || "");
        setNivel(data.nivel_infestacao || "Médio");
        setStatus(data.status || "Em Monitoramento");
        setObservacoes(data.observacoes || "");
      }
      setCarregando(false);
    }
    carregar();
  }, [pragaId]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    try {
      const { error } = await supabase
        .from("pragas")
        .update({
          nome,
          nivel_infestacao: nivel,
          status,
          observacoes
        })
        .eq("id", pragaId);

      if (error) throw error;
      toast.success("Praga atualizada com sucesso!");
      router.push(`/dashboard/pragas/${pragaId}`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar alterações.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <div className="min-h-screen bg-[#07111F] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div></div>;

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">✏️ Editar Praga</h1>
        
        <Card>
          <form onSubmit={salvar} className="space-y-6">
            <div>
              <label className="block text-slate-400 mb-2">Nome da Praga / Doença</label>
              <input 
                type="text" 
                value={nome} 
                onChange={e => setNome(e.target.value)}
                className="w-full bg-[#0F1C30] border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none" 
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-2">Nível de Infestação</label>
                <select 
                  value={nivel} 
                  onChange={e => setNivel(e.target.value)}
                  className="w-full bg-[#0F1C30] border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none"
                >
                  <option value="Baixo">Baixo</option>
                  <option value="Médio">Médio</option>
                  <option value="Alto">Alto</option>
                </select>
              </div>
              
              <div>
                <label className="block text-slate-400 mb-2">Status</label>
                <select 
                  value={status} 
                  onChange={e => setStatus(e.target.value)}
                  className="w-full bg-[#0F1C30] border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none"
                >
                  <option value="Identificado">Identificado</option>
                  <option value="Em Monitoramento">Em Monitoramento</option>
                  <option value="Sob Controle">Sob Controle</option>
                  <option value="Resolvido">Resolvido</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-2">Observações e Detalhes</label>
              <textarea 
                value={observacoes} 
                onChange={e => setObservacoes(e.target.value)}
                className="w-full bg-[#0F1C30] border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none min-h-[120px]" 
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
              <button 
                type="button" 
                onClick={() => router.back()}
                className="px-6 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={salvando}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
