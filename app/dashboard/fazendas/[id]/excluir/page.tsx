"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";

export default function ExcluirFazendaPage({
  params,
}: {
  params: {
    id: string;
  };
}) {

  const router = useRouter();

  async function excluir() {

    const { data: projetos } =
      await supabase
        .from("projetos")
        .select("id")
        .eq("fazenda_id", params.id);

    if (
      projetos &&
      projetos.length > 0
    ) {
      alert(
        `Esta fazenda possui ${projetos.length} projetos vinculados.`
      );

      return;
    }

    const confirmar = confirm(
      "Deseja excluir esta fazenda?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("fazendas")
      .delete()
      .eq("id", params.id);

    if (error) {

      alert(error.message);

      return;
    }

    router.push(
      "/dashboard/fazendas"
    );

    router.refresh();
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