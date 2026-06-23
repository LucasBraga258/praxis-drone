"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";

export default function UploadPage() {
  const params = useParams();
  const projetoId = params.id as string;

  const [pdf, setPdf] = useState<File | null>(null);
  const [orto, setOrto] = useState<File | null>(null);
  const [ndvi, setNdvi] = useState<File | null>(null);
  const [elevacao, setElevacao] = useState<File | null>(null);

  const [enviando, setEnviando] = useState(false);
  const [analisando, setAnalisando] = useState(false);

  async function uploadArquivo(
    arquivo: File,
    bucket: string,
    pasta: string
  ) {
    const nomeArquivo = `${Date.now()}-${arquivo.name}`;

    const caminho = `${pasta}/${nomeArquivo}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(caminho, arquivo);

    if (error) throw error;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(caminho);

    return data.publicUrl;
  }

  async function enviarArquivos() {
    try {
      setEnviando(true);

      let pdfUrl = null;
      let ortoUrl = null;
      let ndviUrl = null;
      let elevacaoUrl = null;

      if (pdf) {
        pdfUrl = await uploadArquivo(
          pdf,
          "relatorios",
          projetoId
        );
      }

      if (orto) {
        ortoUrl = await uploadArquivo(
          orto,
          "imagens",
          projetoId
        );
      }

      if (ndvi) {
        ndviUrl = await uploadArquivo(
          ndvi,
          "imagens",
          projetoId
        );
      }

      if (elevacao) {
        elevacaoUrl = await uploadArquivo(
          elevacao,
          "imagens",
          projetoId
        );
      }

      const { error } = await supabase
        .from("projetos")
        .update({
          pdf_url: pdfUrl,
          ortomosaico_img_url: ortoUrl,
          ndvi_img_url: ndviUrl,
          elevacao_img_url: elevacaoUrl,
        })
        .eq("id", projetoId);

      if (error) {
        console.error(error);
        alert("Erro ao salvar URLs");
        return;
      }

      alert("Arquivos enviados com sucesso!");
    } catch (error: any) {
      console.error(error);

      alert(
        JSON.stringify(error, null, 2)
      );
    } finally {
      setEnviando(false);
    }
  }

  async function analisarProjeto() {
    try {
      setAnalisando(true);

      const { error } = await supabase
        .from("projetos")
        .update({
          analise_status: "Processando",
        })
        .eq("id", projetoId);

      if (error) {
        console.error(error);
        alert("Erro ao iniciar análise");
        return;
      }

      alert("Análise iniciada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao analisar projeto");
    } finally {
      setAnalisando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <h1 className="text-4xl font-bold mb-2">
        Upload de Arquivos
      </h1>

      <p className="text-slate-400 mb-8">
        Envie os arquivos utilizados na análise do projeto.
      </p>

      <div className="grid gap-6 max-w-4xl">

        <div className="bg-[#16253D] p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-3">
            PDF DroneDeploy
          </h2>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) =>
              setPdf(e.target.files?.[0] || null)
            }
          />

          {pdf && (
            <p className="mt-3 text-green-400">
              {pdf.name}
            </p>
          )}
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-3">
            Ortomosaico RGB
          </h2>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setOrto(e.target.files?.[0] || null)
            }
          />

          {orto && (
            <p className="mt-3 text-green-400">
              {orto.name}
            </p>
          )}
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-3">
            Mapa NDVI / VARI
          </h2>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setNdvi(e.target.files?.[0] || null)
            }
          />

          {ndvi && (
            <p className="mt-3 text-green-400">
              {ndvi.name}
            </p>
          )}
        </div>

        <div className="bg-[#16253D] p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-3">
            Modelo de Elevação
          </h2>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setElevacao(e.target.files?.[0] || null)
            }
          />

          {elevacao && (
            <p className="mt-3 text-green-400">
              {elevacao.name}
            </p>
          )}
        </div>

        <div className="flex gap-4">

          <button
            onClick={enviarArquivos}
            disabled={enviando}
            className="bg-green-700 px-6 py-3 rounded-xl font-bold hover:bg-green-800"
          >
            {enviando
              ? "Enviando..."
              : "Enviar Arquivos"}
          </button>

          <button
            onClick={analisarProjeto}
            disabled={analisando}
            className="bg-purple-700 px-6 py-3 rounded-xl font-bold hover:bg-purple-800"
          >
            {analisando
              ? "Analisando..."
              : "Analisar Projeto"}
          </button>

        </div>

      </div>

    </main>
  );
}