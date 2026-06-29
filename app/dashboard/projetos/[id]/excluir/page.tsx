"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";

export default function ExcluirProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const [id, setId] = useState("");
  const [codigo, setCodigo] = useState("");
  const [fazenda, setFazenda] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    async function carregar() {
      const { id } = await params;

      setId(id);

      const { data } = await supabase
        .from("projetos")
        .select(`
          codigo,
          fazenda_id,
          fazendas(nome)
        `)
        .eq("id", id)
        .single();

      if (data) {
        setCodigo(data.codigo);

        if (Array.isArray(data.fazendas)) {
          setFazenda(data.fazendas[0]?.nome || "-");
        } else {
          setFazenda((data.fazendas as any)?.nome || "-");
        }
      }

      setCarregando(false);
    }

    carregar();
  }, [params]);

  async function excluirProjeto() {
    setExcluindo(true);

    // Verifica se existem intervenções

    const { count } = await supabase
      .from("intervencoes")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("fazenda_id", id);

    if ((count || 0) > 0) {
      alert(
        "Este projeto possui informações relacionadas. Exclua os vínculos antes."
      );

      setExcluindo(false);
      return;
    }

    const { error } = await supabase
      .from("projetos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);

      alert("Erro ao excluir projeto.");

      setExcluindo(false);

      return;
    }

    alert("Projeto excluído com sucesso!");

    router.push("/dashboard/projetos");
    router.refresh();
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#07111F] text-white p-8">
        Carregando...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <div className="max-w-2xl bg-[#16253D] rounded-2xl p-8">

        <h1 className="text-4xl font-bold mb-6 text-red-400">
          ⚠ Excluir Projeto
        </h1>

        <p className="mb-6 text-lg">
          Tem certeza que deseja excluir este projeto?
        </p>

        <div className="space-y-3 mb-8">

          <p>
            <strong>Código:</strong> {codigo}
          </p>

          <p>
            <strong>Fazenda:</strong> {fazenda}
          </p>

        </div>

        <div className="flex gap-4">

          <button
            onClick={() => router.back()}
            className="bg-slate-600 px-6 py-3 rounded-xl font-bold"
          >
            Cancelar
          </button>

          <button
            onClick={excluirProjeto}
            disabled={excluindo}
            className="bg-red-700 px-6 py-3 rounded-xl font-bold hover:bg-red-800"
          >
            {excluindo
              ? "Excluindo..."
              : "Excluir Projeto"}
          </button>

        </div>

      </div>

    </main>
  );
}