"use client";

/**
 * MissionGallery — Galeria Profissional de Imagens
 *
 * Exibe as fotos do monitoramento com metadados EXIF:
 * Drone, Câmera, GPS, Altitude, Heading, Data/Hora
 * Zoom, Download, informações técnicas.
 */

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Card from "@/app/components/ui/Card";

interface ArquivoFoto {
  id: number;
  nome: string;
  caminho: string;
  url: string | null;
  tamanho: number;
  created_at: string;
  metadata: {
    latitude?: number | null;
    longitude?: number | null;
    altitude?: number | null;
    heading?: number | null;
    drone_modelo?: string | null;
    camera_modelo?: string | null;
    timestamp?: string | null;
    largura?: number | null;
    altura?: number | null;
    exif_extraido?: boolean;
  } | null;
}

interface Props {
  projetoId: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function MissionGallery({ projetoId }: Props) {
  const supabase = createClient();
  const [fotos, setFotos] = useState<ArquivoFoto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [fotoSelecionada, setFotoSelecionada] = useState<ArquivoFoto | null>(null);
  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 48;

  const carregarFotos = useCallback(async () => {
    const { data } = await supabase
      .from("arquivos_projeto")
      .select("id, nome, caminho, url, tamanho, created_at, metadata")
      .eq("projeto_id", projetoId)
      .eq("tipo", "foto")
      .order("created_at", { ascending: true });

    setFotos((data as ArquivoFoto[]) ?? []);
    setCarregando(false);
  }, [projetoId]);

  useEffect(() => {
    carregarFotos();

    const channel = supabase
      .channel(`gallery-${projetoId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "arquivos_projeto",
          filter: `projeto_id=eq.${projetoId}`,
        },
        carregarFotos
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [projetoId, carregarFotos]);

  const paginaAtual = fotos.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const totalPaginas = Math.ceil(fotos.length / POR_PAGINA);

  const fotosComGPS = fotos.filter((f) => f.metadata?.latitude != null).length;
  const tamanhoTotal = fotos.reduce((acc, f) => acc + (f.tamanho ?? 0), 0);

  const droneModelo = fotos.find((f) => f.metadata?.drone_modelo)?.metadata?.drone_modelo;
  const cameraModelo = fotos.find((f) => f.metadata?.camera_modelo)?.metadata?.camera_modelo;

  if (carregando) {
    return (
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 rounded skeleton" />
          <div className="w-32 h-5 rounded skeleton" />
        </div>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg skeleton" />
          ))}
        </div>
      </Card>
    );
  }

  if (fotos.length === 0) {
    return (
      <Card>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
          📷 Galeria de Imagens
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
          Nenhuma foto enviada ainda. Faça o upload para visualizar a galeria.
        </p>
        <div
          style={{
            height: 120,
            border: "1px dashed rgba(255,255,255,0.1)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            fontSize: 13,
          }}
        >
          📂 Galeria vazia
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
              📷 Galeria de Imagens
            </h2>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-muted)" }}>
              <span>{fotos.length} fotos</span>
              <span>{fotosComGPS} com GPS</span>
              <span>{formatBytes(tamanhoTotal)}</span>
              {droneModelo && <span>🚁 {droneModelo}</span>}
              {cameraModelo && <span>📷 {cameraModelo}</span>}
            </div>
          </div>
        </div>

        {/* Grid de Miniaturas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gap: 6,
          }}
        >
          {paginaAtual.map((foto) => {
            const temGPS = foto.metadata?.latitude != null;
            return (
              <button
                key={foto.id}
                onClick={() => setFotoSelecionada(foto)}
                style={{
                  position: "relative",
                  aspectRatio: "1",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--bg-border)",
                  borderRadius: 8,
                  overflow: "hidden",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.15s",
                }}
                title={foto.nome}
              >
                {foto.url ? (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: `url(${foto.url}) center/cover no-repeat`,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      color: "var(--text-muted)",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>🖼️</span>
                    <span style={{ fontSize: 8, maxWidth: "90%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {foto.nome.replace(/\.[^.]+$/, "").slice(-8)}
                    </span>
                  </div>
                )}

                {/* Badge GPS */}
                {temGPS && (
                  <div
                    style={{
                      position: "absolute",
                      top: 3,
                      right: 3,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#22c55e",
                      border: "1.5px solid rgba(0,0,0,0.5)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 16, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => setPagina(Math.max(1, pagina - 1))}
              disabled={pagina === 1}
              style={{
                padding: "6px 14px",
                background: "var(--bg-hover)",
                border: "1px solid var(--bg-border)",
                borderRadius: 8,
                color: "var(--text-secondary)",
                cursor: pagina === 1 ? "not-allowed" : "pointer",
                opacity: pagina === 1 ? 0.4 : 1,
                fontSize: 12,
              }}
            >
              ← Anterior
            </button>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {pagina} / {totalPaginas}
            </span>
            <button
              onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
              disabled={pagina === totalPaginas}
              style={{
                padding: "6px 14px",
                background: "var(--bg-hover)",
                border: "1px solid var(--bg-border)",
                borderRadius: 8,
                color: "var(--text-secondary)",
                cursor: pagina === totalPaginas ? "not-allowed" : "pointer",
                opacity: pagina === totalPaginas ? 0.4 : 1,
                fontSize: 12,
              }}
            >
              Próximo →
            </button>
            </div>
            <button
              disabled={true}
              style={{
                background: "transparent",
                border: "1px solid var(--bg-border)",
                color: "var(--text-secondary)",
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 13,
                cursor: "not-allowed",
              }}
            >
              🔄 Comparar com missão anterior
            </button>
          </div>
        )}
      </Card>

      {/* Modal de Detalhe da Foto */}
      {fotoSelecionada && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setFotoSelecionada(null)}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--bg-border)",
              borderRadius: 20,
              padding: 28,
              maxWidth: 520,
              width: "100%",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setFotoSelecionada(null)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "var(--bg-hover)",
                border: "none",
                color: "var(--text-secondary)",
                borderRadius: 8,
                padding: "4px 10px",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              ✕ Fechar
            </button>

            {/* Visualizador */}
            <div
              style={{
                height: 320,
                background: fotoSelecionada.url ? `url(${fotoSelecionada.url}) center/contain no-repeat` : "var(--bg-surface)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                border: "1px solid var(--bg-border)",
                fontSize: 48,
              }}
            >
              {!fotoSelecionada.url && "🖼️"}
            </div>

            <h3 style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 4 }}>
              {fotoSelecionada.nome}
            </h3>

            {/* Metadados */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
              {[
                { label: "Tamanho", value: formatBytes(fotoSelecionada.tamanho) },
                { label: "Data upload", value: new Date(fotoSelecionada.created_at).toLocaleDateString("pt-BR") },
                fotoSelecionada.metadata?.drone_modelo && { label: "🚁 Drone", value: fotoSelecionada.metadata.drone_modelo },
                fotoSelecionada.metadata?.camera_modelo && { label: "📷 Câmera", value: fotoSelecionada.metadata.camera_modelo },
                fotoSelecionada.metadata?.latitude != null && { label: "Latitude", value: fotoSelecionada.metadata.latitude?.toFixed(6) },
                fotoSelecionada.metadata?.longitude != null && { label: "Longitude", value: fotoSelecionada.metadata.longitude?.toFixed(6) },
                fotoSelecionada.metadata?.altitude != null && { label: "Altitude", value: `${fotoSelecionada.metadata.altitude?.toFixed(1)} m` },
                fotoSelecionada.metadata?.heading != null && { label: "Heading", value: `${fotoSelecionada.metadata.heading?.toFixed(0)}°` },
                fotoSelecionada.metadata?.largura && { label: "Resolução", value: `${fotoSelecionada.metadata.largura} × ${fotoSelecionada.metadata.altura} px` },
              ].filter(Boolean).map((item: any) => (
                <div
                  key={item.label}
                  style={{
                    background: "var(--bg-surface)",
                    borderRadius: 8,
                    padding: "8px 12px",
                  }}
                >
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 600, marginTop: 2 }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
