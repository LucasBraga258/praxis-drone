"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { uploadFotosProjeto }
from "../../../../../lib/services/upload";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { validarFotos }
from "../../../../../lib/services/missionValidator";
import ValidacaoMissao
from "@/app/components/ValidacaoMissao";
import dynamic from "next/dynamic";

const UploadMap = dynamic(() => import("@/app/components/UploadMap"), { ssr: false });

export default function UploadPage() {
  const supabase = createClient();
  const params = useParams();
  const projetoId = params.id as string;

  const [enviando, setEnviando] = useState(false);
  const [analisando, setAnalisando] = useState(false);
  const [resultadoValidacao, setResultadoValidacao] =
  useState<any>(null);

  const [areaHectares, setAreaHectares] = useState<number | null>(null);
  const [geoJsonRecorte, setGeoJsonRecorte] = useState<any>(null);

  const [arquivos, setArquivos] = useState<File[]>([]);
  const { getRootProps, getInputProps, isDragActive } =
  useDropzone({
    multiple: true,

    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/tiff": [".tif", ".tiff"],
    },

   onDrop: async (acceptedFiles) => {

  setArquivos(acceptedFiles);

  const resultado =
    await validarFotos(acceptedFiles);

  console.log(resultado);

  setResultadoValidacao(resultado);

},
  });
  const [progresso, setProgresso] = useState(0);

const [arquivoAtual, setArquivoAtual] =
  useState("");

const [totalEnviado, setTotalEnviado] =
  useState(0);

const tamanhoTotal = arquivos.reduce(
  (acc, file) => acc + file.size,
  0
);


  async function enviarArquivos() {

  if (!arquivos.length) {
    toast.warning("Selecione as fotos primeiro.");
    return;
  }

  try {

    setEnviando(true);

    await uploadFotosProjeto(

  Number(projetoId),

  arquivos,

  (progress) => {

    setProgresso(
      progress.percentual
    );

    setArquivoAtual(
      progress.arquivoAtual
    );

    setTotalEnviado(
      progress.enviados
    );

  }

);

    toast.success(
`${arquivos.length} fotos enviadas com sucesso!`
);

    setArquivos([]);

  } catch (error: any) {

  console.error(error);

  toast.error(
    error.message ??
    "Erro ao enviar arquivos."
  );



  } finally {

    setEnviando(false);

  }


}

  async function analisarProjeto() {
    try {
      setAnalisando(true);

      // (Opcional) Salvar a area estimada e o recorte no projeto antes de iniciar
      if (areaHectares !== null) {
        await supabase.from("projetos").update({ area_mapeada: areaHectares }).eq("id", projetoId);
      }

      // 1. O novo Fluxo: Disparar a Máquina de Estados (API Assíncrona)
      const res = await fetch("/api/pipeline/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projetoId }),
      });

      if (!res.ok) throw new Error("Falha ao iniciar Pipeline");

      // Atualizar interface visual para o usuário
      toast.success("Processamento em nuvem iniciado! Você pode sair desta tela.");
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao iniciar orquestração.");
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

        {/* MAPA INTERATIVO (Área de Interesse) */}
        <UploadMap onAreaCalculated={(area, geo) => {
          setAreaHectares(area);
          setGeoJsonRecorte(geo);
        }} />

        <div className="bg-[#16253D] rounded-xl p-8">

  <div
    {...getRootProps()}
    className={`
      border-2
      border-dashed
      rounded-xl
      p-16
      text-center
      cursor-pointer
      transition

      ${
        isDragActive
          ? "border-green-500 bg-green-900/20"
          : "border-slate-600"
      }
    `}
  >

    <input {...getInputProps()} />

    <h2 className="text-3xl font-bold mb-4">
      📷 Enviar Fotos do Voo
    </h2>

    <p className="text-slate-400">

      Arraste as fotos aqui

      <br />

      ou

      <br />

      clique para selecionar

    </p>

  </div>

</div>

{enviando && (

  <div className="bg-[#16253D] rounded-xl p-6">

    <h2 className="text-2xl font-bold mb-4">

      📤 Enviando Fotos

    </h2>

    <div className="w-full bg-[#0F1C30] rounded-full h-5 overflow-hidden">

      <div
        className="bg-green-500 h-5 transition-all duration-300"
        style={{
          width: `${progresso}%`,
        }}
      />

    </div>

    <div className="flex justify-between mt-3">

      <p className="text-green-400 font-bold">

        {progresso}%

      </p>

      <p className="text-slate-300">

        {totalEnviado} / {arquivos.length} fotos

      </p>

    </div>

    <p className="mt-4 text-slate-400">

      📷 {arquivoAtual}

    </p>

  </div>

)}

{arquivos.length > 0 && (

  <div className="bg-[#16253D] rounded-xl p-6">

    <h2 className="text-2xl font-bold mb-4">

      Fotos Selecionadas

    </h2>

    <p>

      📷 {arquivos.length} arquivos

    </p>

    <p>

      💾 {(tamanhoTotal / 1024 / 1024).toFixed(2)} MB

    </p>

    <div className="mt-6 max-h-64 overflow-auto">

      {arquivos.slice(0,20).map((arquivo) => (

        <div
          key={arquivo.name}
          className="py-2 border-b border-slate-700"
        >

          {arquivo.name}

        </div>

      ))}

      {arquivos.length > 20 && (

        <p className="mt-4 text-slate-400">

          ...e mais {arquivos.length-20} arquivos

        </p>

      )}
      

    </div>
{resultadoValidacao && (
  <ValidacaoMissao
    resultado={resultadoValidacao}
  />
)}
  </div>
  

)}

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