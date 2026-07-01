"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, use } from "react";

export default function ExcluirFazendaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = createClient();
  const router = useRouter();
  const { id } = use(params);
  const [excluindo, setExcluindo] = useState(false);

  async function excluir() {
    const confirmar = confirm(
      "Deseja excluir esta fazenda? ATENÇÃO: Isso excluirá permanentemente todos os talhões, missões, pragas e intervenções vinculadas a ela."
    );

    if (!confirmar) return;
    setExcluindo(true);

    try {
      // Cascade delete manually (order matters due to FKs)
      
      // 0. Delete notificações
      await supabase.from("notificacoes").delete().eq("fazenda_id", id);
      
      // 1. Delete pragas
      await supabase.from("pragas").delete().eq("fazenda_id", id);
      
      // 2. Delete intervencoes
      await supabase.from("intervencoes").delete().eq("fazenda_id", id);

      // 3. Delete arquivos vinculados aos projetos da fazenda
      const { data: projetos } = await supabase.from("projetos").select("id").eq("fazenda_id", id);
      if (projetos && projetos.length > 0) {
        const projetoIds = projetos.map(p => p.id);
        await supabase.from("arquivos").delete().in("projeto_id", projetoIds);
      }

      // 4. Delete projetos
      await supabase.from("projetos").delete().eq("fazenda_id", id);

      // 5. Delete talhoes
      await supabase.from("talhoes").delete().eq("fazenda_id", id);

      // 6. Finalmente, delete a fazenda
      const { error } = await supabase.from("fazendas").delete().eq("id", id);

      if (error) {
        alert("Erro ao excluir fazenda: " + error.message);
        setExcluindo(false);
        return;
      }

      router.push("/dashboard/fazendas");
      router.refresh();
    } catch (err: any) {
      alert("Ocorreu um erro ao excluir: " + err.message);
      setExcluindo(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-6">
        Excluir Fazenda
      </h1>

      <p className="text-red-400 mb-8">
        Esta ação não poderá ser desfeita.
      </p>

      <button
        onClick={excluir}
        className="
          bg-red-700
          px-6
          py-3
          rounded-xl
          font-bold
        "
      >
        Confirmar Exclusão
      </button>

    </main>
  );
}