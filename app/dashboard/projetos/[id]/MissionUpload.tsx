"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Card from "@/app/components/ui/Card";
import { uploadFotosProjeto } from "@/lib/services/upload";
import { validarFotos } from "@/lib/services/missionValidator";
import type { ResultadoValidacao } from "@/lib/services/missionValidator/interfaces";
import ValidacaoMissao from "@/app/components/ValidacaoMissao";

interface MissionUploadProps {
  projetoId: number;
}

export default function MissionUpload({ projetoId }: MissionUploadProps) {
  const router = useRouter();
  
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [resultadoValidacao, setResultadoValidacao] = useState<ResultadoValidacao | null>(null);
  const [validando, setValidando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [arquivoAtual, setArquivoAtual] = useState("");
  const [totalEnviado, setTotalEnviado] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setValidando(true);
    setArquivos(acceptedFiles);
    
    try {
      const resultado = await validarFotos(acceptedFiles);
      setResultadoValidacao(resultado);
    } catch (error) {
      console.error("Erro na validação:", error);
      toast.error("Erro ao validar as fotos.");
    } finally {
      setValidando(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/tiff": [".tif", ".tiff"],
    },
    disabled: enviando || validando,
  });

  const enviarArquivos = async () => {
    if (!arquivos.length) {
      toast.warning("Selecione as fotos primeiro.");
      return;
    }

    // Se houver erros graves, confirmar
    if (resultadoValidacao?.erros && resultadoValidacao.erros.length > 0) {
      const confirmar = window.confirm("Existem erros na validação. Deseja enviar mesmo assim?");
      if (!confirmar) return;
    }

    try {
      setEnviando(true);

      await uploadFotosProjeto(
        projetoId,
        arquivos,
        (progress) => {
          setProgresso(progress.percentual);
          setArquivoAtual(progress.arquivoAtual);
          setTotalEnviado(progress.enviados);
        }
      );

      toast.success(`${arquivos.length} fotos enviadas com sucesso!`);
      setArquivos([]);
      setResultadoValidacao(null);
      
      // Atualizar a página para buscar os novos dados
      router.refresh();
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message ?? "Erro ao enviar arquivos.");
    } finally {
      setEnviando(false);
      setProgresso(0);
      setArquivoAtual("");
      setTotalEnviado(0);
    }
  };

  const cancelarUpload = () => {
    setArquivos([]);
    setResultadoValidacao(null);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-white">Upload de Imagens</h2>
        {arquivos.length > 0 && !enviando && (
          <button 
            onClick={cancelarUpload}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Limpar seleção
          </button>
        )}
      </div>

      {arquivos.length === 0 ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl h-44
            flex flex-col items-center justify-center
            transition-colors duration-200 cursor-pointer
            ${isDragActive 
              ? "border-emerald-500 bg-emerald-900/10" 
              : "border-slate-600 hover:border-emerald-600"
            }
          `}
        >
          <input {...getInputProps()} />
          <p className="text-lg text-slate-300 font-medium">
            Arraste uma pasta aqui
          </p>
          <p className="text-slate-500 text-sm mt-2">
            ou clique para selecionar arquivos
          </p>
          <p className="text-xs text-slate-600 mt-4">
            JPG, JPEG, TIFF — máximo recomendado: 2000 imagens
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {validando ? (
            <div className="flex flex-col items-center justify-center py-10 bg-[#0F1C30] rounded-xl border border-slate-700">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-white font-medium">Extraindo metadados...</p>
              <p className="text-slate-500 text-sm mt-1">Analisando {arquivos.length} fotos</p>
            </div>
          ) : (
            <>
              {resultadoValidacao && <ValidacaoMissao resultado={resultadoValidacao} />}
              
              {!enviando && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={enviarArquivos}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
                  >
                    Iniciar Upload ({arquivos.length} fotos)
                  </button>
                </div>
              )}
            </>
          )}

          {enviando && (
            <div className="bg-[#0F1C30] p-5 rounded-xl border border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-medium">Enviando arquivos...</span>
                <span className="text-emerald-400 font-bold">{progresso}%</span>
              </div>
              
              <div className="w-full bg-[#16253D] rounded-full h-3 overflow-hidden mb-3">
                <div 
                  className="bg-emerald-500 h-3 transition-all duration-300"
                  style={{ width: `${progresso}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-slate-400">
                <span className="truncate max-w-[70%]">Processando: {arquivoAtual}</span>
                <span>{totalEnviado} / {arquivos.length}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}