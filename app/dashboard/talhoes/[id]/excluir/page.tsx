"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ExcluirTalhaoPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const [excluindo, setExcluindo] = useState(false);
  const talhaoId = params.id as string;

  async function excluirTalhao() {
    const confirmar = confirm("Deseja excluir este talhão? ATENÇÃO: Todas as missões e dados vinculados serão perdidos permanentemente.");
    if (!confirmar) return;

    setExcluindo(true);

    try {
      // 1. Encontrar projetos vinculados para deletar arquivos
      const { data: projetos } = await supabase.from("projetos").select("id").eq("talhao_id", talhaoId);
      if (projetos && projetos.length > 0) {
        const projetoIds = projetos.map(p => p.id);
        await supabase.from("arquivos").delete().in("projeto_id", projetoIds);
      }

      // 2. Delete projetos vinculados
      await supabase.from("projetos").delete().eq("talhao_id", talhaoId);

      // 3. Delete talhão
      const { error } = await supabase.from("talhoes").delete().eq("id", talhaoId);

      if (error) {
        console.error(error);
        alert("Erro ao excluir talhão: " + error.message);
        setExcluindo(false);
        return;
      }

      alert("Talhão excluído com sucesso!");
      router.push("/dashboard/fazendas");
      router.refresh();
    } catch (err: any) {
      alert("Erro interno ao excluir talhão: " + err.message);
      setExcluindo(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">
      <div className="max-w-2xl bg-[#16253D] rounded-2xl p-8">
        <h1 className="text-4xl font-bold mb-6 text-red-400">
          ⚠ Excluir Talhão
        </h1>

        <p className="mb-6 text-lg">
          Tem certeza que deseja excluir este talhão?
        </p>

        <p className="text-slate-400 mb-8 bg-red-900/20 p-4 rounded-xl border border-red-900/50">
          ATENÇÃO: A exclusão de um talhão também removerá todas as missões, ortomosaicos e arquivos vinculados a ele. Esta ação é irreversível.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition"
          >
            Cancelar
          </button>

          <button
            onClick={excluirTalhao}
            disabled={excluindo}
            className="bg-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50"
          >
            {excluindo ? "Excluindo..." : "Sim, Excluir Talhão"}
          </button>
        </div>
      </div>
    </main>
  );
}
