"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Card from "@/app/components/ui/Card";

interface Notificacao {
  id: number;
  titulo: string;
  descricao: string;
  tipo: "info" | "atencao" | "critico";
  lida: boolean;
  created_at: string;
  fazenda_id?: number | null;
  fazendas?: { nome: string };
}

export default function AlertasManager() {
  const supabase = createClient();
  const [alertas, setAlertas] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Notificacao>>({
    titulo: "",
    descricao: "",
    tipo: "info",
    fazenda_id: null,
  });

  const carregarAlertas = async () => {
    setCarregando(true);
    const { data } = await supabase
      .from("notificacoes")
      .select(`*, fazendas(nome)`)
      .order("created_at", { ascending: false });
    
    setAlertas(data || []);
    setCarregando(false);
  };

  useEffect(() => {
    carregarAlertas();
  }, []);

  const handleSalvar = async () => {
    if (!formData.titulo || !formData.descricao) return;

    if (formData.id) {
      await supabase
        .from("notificacoes")
        .update({
          titulo: formData.titulo,
          descricao: formData.descricao,
          tipo: formData.tipo,
        })
        .eq("id", formData.id);
    } else {
      await supabase
        .from("notificacoes")
        .insert([{
          titulo: formData.titulo,
          descricao: formData.descricao,
          tipo: formData.tipo || "info",
          lida: false,
        }]);
    }

    setIsModalOpen(false);
    carregarAlertas();
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este alerta?")) return;
    
    // Atualização otimista na interface
    setAlertas((prev) => prev.filter((a) => a.id !== id));
    
    const { error } = await supabase.from("notificacoes").delete().eq("id", id);
    if (error) {
      console.error(error);
      alert("Erro ao excluir: " + error.message);
      // Em caso de erro, recarrega para voltar o estado original
      carregarAlertas();
    }
  };

  const abrirModal = (alerta?: Notificacao) => {
    if (alerta) {
      setFormData(alerta);
    } else {
      setFormData({ titulo: "", descricao: "", tipo: "info", fazenda_id: null });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">🚨 Gerenciar Alertas</h1>
        <button
          onClick={() => abrirModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          + Novo Alerta
        </button>
      </div>

      {carregando ? (
        <div className="text-slate-400">Carregando alertas...</div>
      ) : (
        <div className="grid gap-4">
          {alertas.length === 0 ? (
            <p className="text-slate-400">Nenhum alerta cadastrado.</p>
          ) : (
            alertas.map((alerta) => (
              <Card key={alerta.id} className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        alerta.tipo === "critico"
                          ? "bg-red-500/20 text-red-400"
                          : alerta.tipo === "atencao"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-cyan-500/20 text-cyan-400"
                      }`}
                    >
                      {alerta.tipo}
                    </span>
                    <h3 className="text-lg font-bold text-white">{alerta.titulo}</h3>
                  </div>
                  <p className="text-slate-400 text-sm">{alerta.descricao}</p>
                  {alerta.fazendas?.nome && (
                    <p className="text-slate-500 text-xs mt-2 font-medium">📍 {alerta.fazendas.nome}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => abrirModal(alerta)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(alerta.id)}
                    className="bg-red-600/20 hover:bg-red-600/40 text-red-400 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#16253D] rounded-2xl p-6 w-full max-w-lg border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">
              {formData.id ? "Editar Alerta" : "Novo Alerta"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Título</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full bg-[#0F1C30] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                  placeholder="Ex: Risco de Praga"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-[#0F1C30] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                  placeholder="Detalhes do alerta..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Tipo de Alerta</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                  className="w-full bg-[#0F1C30] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                >
                  <option value="info">Informação</option>
                  <option value="atencao">Atenção</option>
                  <option value="critico">Crítico</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
