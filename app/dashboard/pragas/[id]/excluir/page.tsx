"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";
import Card from "@/app/components/ui/Card";
import { toast } from "sonner";

export default function PragaExcluirPage() {
  const params = useParams();
  const router = useRouter();
  const pragaId = params.id as string;
  const [excluindo, setExcluindo] = useState(false);

  async function confirmarExclusao() {
    setExcluindo(true);
    try {
      const { error } = await supabase.from("pragas").delete().eq("id", pragaId);
      if (error) throw error;
      toast.success("Registro de praga excluído com sucesso.");
      router.push("/dashboard/pragas"); // Redireciona para a lista geral caso exista
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir praga.");
      setExcluindo(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card className="border-red-900/50 bg-[#16253D]">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🗑️
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Excluir Registro?</h1>
            <p className="text-slate-400 text-sm">
              Esta ação é permanente e não poderá ser desfeita. Tem certeza que deseja remover esta identificação de praga?
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => router.back()}
              className="flex-1 px-4 py-2.5 rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
            >
              Cancelar
            </button>
            <button 
              onClick={confirmarExclusao}
              disabled={excluindo}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
            >
              {excluindo ? "Excluindo..." : "Sim, Excluir"}
            </button>
          </div>
        </Card>
      </div>
    </main>
  );
}
