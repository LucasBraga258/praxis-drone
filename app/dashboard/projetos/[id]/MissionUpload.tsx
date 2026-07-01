"use client";

/**
 * MissionUpload — Componente de Upload Premium
 *
 * Fluxo:
 * 1. Drag & Drop de fotos
 * 2. Validação (Mission Validator)
 * 3. Extração EXIF automática (mostra preview das coords)
 * 4. Upload com progresso detalhado
 * 5. Após upload: emite callback com dados do voo para o mapa
 */

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Card from "@/app/components/ui/Card";
import { uploadFotosProjeto } from "@/lib/services/upload";
import type { UploadResultado } from "@/lib/services/upload";
import { validarFotos } from "@/lib/services/missionValidator";
import type { ResultadoValidacao } from "@/lib/services/missionValidator/interfaces";
import ValidacaoMissao from "@/app/components/ValidacaoMissao";

interface MissionUploadProps {
  projetoId: number;
  onUploadConcluido?: (resultado: UploadResultado) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function MissionUpload({ projetoId, onUploadConcluido }: MissionUploadProps) {
  const router = useRouter();

  const [arquivos, setArquivos] = useState<File[]>([]);
  const [resultadoValidacao, setResultadoValidacao] = useState<ResultadoValidacao | null>(null);
  const [validando, setValidando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [arquivoAtual, setArquivoAtual] = useState("");
  const [totalEnviado, setTotalEnviado] = useState(0);
  const [fase, setFase] = useState<"upload" | "exif" | "concluido">("upload");
  const [concluido, setConcluido] = useState(false);

  const tamanhoTotal = arquivos.reduce((acc, f) => acc + f.size, 0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setValidando(true);
    setArquivos(acceptedFiles);
    setConcluido(false);

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
    multiple: true,
  });

  const enviarArquivos = async () => {
    if (!arquivos.length) {
      toast.warning("Selecione as fotos primeiro.");
      return;
    }

    if (resultadoValidacao?.erros && resultadoValidacao.erros.length > 0) {
      const confirmar = window.confirm(
        "Existem erros na validação. Deseja enviar mesmo assim?"
      );
      if (!confirmar) return;
    }

    try {
      setEnviando(true);

      const resultado = await uploadFotosProjeto(
        projetoId,
        arquivos,
        (progress) => {
          setProgresso(progress.percentual);
          setArquivoAtual(progress.arquivoAtual);
          setTotalEnviado(progress.enviados);
          setFase(progress.fase);
        }
      );

      toast.success(
        `✅ ${resultado.totalEnviadas} fotos enviadas! ${resultado.totalComGPS > 0 ? `📍 ${resultado.totalComGPS} com GPS.` : ""}`
      );

      setConcluido(true);
      setArquivos([]);
      setResultadoValidacao(null);
      onUploadConcluido?.(resultado);

      // Refrescar a página para buscar dados atualizados
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
    setConcluido(false);
  };

  // ── Estado: Concluído ──
  if (concluido) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
            Upload Concluído!
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            As fotos foram enviadas e o processamento foi iniciado automaticamente.
          </p>
          <button
            onClick={cancelarUpload}
            style={{
              marginTop: 16,
              padding: "8px 20px",
              background: "var(--bg-hover)",
              border: "1px solid var(--bg-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Enviar mais fotos
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>
          📤 Upload de Imagens
        </h2>
        {arquivos.length > 0 && !enviando && (
          <button
            onClick={cancelarUpload}
            style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
          >
            Limpar
          </button>
        )}
      </div>

      {/* ── Estado: Enviando ── */}
      {enviando && (
        <div style={{ marginBottom: 20 }}>
          {/* Fase indicador */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {(["exif", "upload", "concluido"] as const).map((f) => (
              <div
                key={f}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 999,
                  background: fase === f
                    ? "var(--praxis-green-500)"
                    : (fase === "upload" && f === "exif") || (fase === "concluido")
                    ? "var(--praxis-green-500)"
                    : "var(--bg-hover)",
                  transition: "all 0.4s",
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
              {fase === "exif" ? "🔍 Extraindo GPS..." :
               fase === "upload" ? "☁️ Enviando para a nuvem..." :
               "✅ Finalizando..."}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#4ade80" }}>
              {progresso}%
            </span>
          </div>

          <div style={{ height: 8, background: "var(--bg-surface)", borderRadius: 999, overflow: "hidden", marginBottom: 10 }}>
            <div
              style={{
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg, #22c55e, #16a34a)",
                width: `${progresso}%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" }}>
            <span style={{ maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {arquivoAtual}
            </span>
            <span>
              {fase === "upload" ? `${totalEnviado} / ${arquivos.length}` : ""}
            </span>
          </div>
        </div>
      )}

      {/* ── Estado: Sem arquivos (dropzone) ── */}
      {arquivos.length === 0 && !enviando && (
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? "#22c55e" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 14,
            padding: "40px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: isDragActive ? "rgba(34,197,94,0.05)" : "transparent",
            transition: "all 0.2s ease",
          }}
        >
          <input {...getInputProps()} />
          <div style={{ fontSize: 36, marginBottom: 12 }}>
            {isDragActive ? "📂" : "📷"}
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
            {isDragActive ? "Solte as fotos aqui" : "Arraste as fotos do voo"}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
            ou clique para selecionar arquivos
          </p>
          <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
            JPG, JPEG, TIFF — até 2000 imagens
          </p>
        </div>
      )}

      {/* ── Estado: Arquivos selecionados ── */}
      {arquivos.length > 0 && !enviando && (
        <div style={{ marginBottom: 20 }}>
          {validando ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0" }}>
              <div className="animate-spin" style={{ width: 32, height: 32, border: "3px solid #22c55e", borderTopColor: "transparent", borderRadius: "50%", marginBottom: 12 }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Analisando metadados...</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{arquivos.length} fotos selecionadas</p>
            </div>
          ) : (
            <>
              {/* Resumo da seleção */}
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--bg-border)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 16,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Fotos</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{arquivos.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tamanho total</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{formatBytes(tamanhoTotal)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Formato</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#4ade80" }}>
                    {arquivos[0]?.name.split(".").pop()?.toUpperCase() ?? "JPG"}
                  </div>
                </div>
              </div>

              {resultadoValidacao && <ValidacaoMissao resultado={resultadoValidacao} />}
            </>
          )}
        </div>
      )}

      {/* ── Botão de upload ── */}
      {arquivos.length > 0 && !enviando && !validando && (
        <button
          onClick={enviarArquivos}
          style={{
            width: "100%",
            padding: "13px",
            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            border: "none",
            borderRadius: "var(--radius-md)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(34,197,94,0.3)",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          🚀 Iniciar Upload e Processamento ({arquivos.length} fotos)
        </button>
      )}
    </Card>
  );
}