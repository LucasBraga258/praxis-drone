"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";

export default function ExcluirEmpresaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = use(params);

  const router = useRouter();

  async function excluir() {

    const confirmar = confirm(
      "Deseja realmente excluir esta empresa?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("empresas_parceiras")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Empresa excluída.");

    router.push(
      "/dashboard/empresas"
    );

    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <div className="flex gap-3 mb-8">

        <Link
          href={`/dashboard/empresas/${id}`}
          className="bg-[#16253D] px-4 py-2 rounded-xl"
        >
          ← Voltar
        </Link>

      </div>

      <h1 className="text-4xl font-bold mb-8">
        Excluir Empresa
      </h1>

      <div
        className="
          bg-[#16253D]
          p-6
          rounded-xl
          max-w-xl
        "
      >

        <p className="mb-6">
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
          Excluir Empresa
        </button>

      </div>

    </main>
  );
}