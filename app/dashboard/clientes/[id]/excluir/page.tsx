"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";

export default function ExcluirClientePage({
  params,
}: {
  params: {
    id: string;
  };
}) {

  const router = useRouter();

  async function excluir() {

    const confirmar =
      confirm(
        "Deseja realmente excluir este cliente?"
      );

    if (!confirmar) return;

    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id", params.id);

    if (error) {

      alert(error.message);

      return;
    }

    router.push(
      "/dashboard/clientes"
    );

    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        Excluir Cliente
      </h1>

      <p className="mb-8 text-red-400">
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