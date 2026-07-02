"use client";

/**
 * PipelineProjeto — Pipeline Visual Premium
 *
 * Exibe o progresso do processamento em tempo real.
 * Usa polling leve (5s) e Supabase Realtime para atualizações.
 *
 * Etapas: Upload → EXIF → Área → NodeODM → Ortomosaico → NDVI → IA → Relatório
 */

import { useEffect, useState, useCallback } from "react";
import { buscarPipelineProjeto } from "../../lib/services/processamento";
import { createClient } from "../../lib/supabase/client";

const supabase = createClient();

interface Props {
  projetoId: number;
}

interface Etapa {
  id: string;
  etapa: string;
  status: string;
  progresso: number;
  icone: string;
}

const ICONES_ETAPA: Record<string, string> = {
  // Drone
  "Upload & Verificação": "📤",
  "Diagnóstico de Nuvem": "🔍",
  "OpenDroneMap (Fotogrametria)": "⚙️",
  // Sentinel
  "Busca de Imagens (Sentinel-2)": "🛰️",
  "Geração de Índices (TiTiler)": "🗺️",
  // Ambos
  "IA Praxis (Anomalias)": "🧠",
  "Relatório & Entrega": "📄",
};

function corStatus(status: string): string {
  switch (status) {
    case "Concluído":     return "#22c55e";
    case "Processando":  return "#3b82f6";
    case "Retentando...": return "#f59e0b";
    case "Erro":         return "#ef4444";
    default:             return "#475569";
  }
}

function bgStatus(status: string): string {
  switch (status) {
    case "Concluído":    return "rgba(34,197,94,0.1)";
    case "Processando": return "rgba(59,130,246,0.1)";
    case "Retentando...": return "rgba(245,158,11,0.1)";
    case "Erro":        return "rgba(239,68,68,0.1)";
    default:            return "rgba(71,85,105,0.1)";
  }
}

function iconeStatus(status: string, animando: boolean): React.ReactNode {
  if (status === "Concluído") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (status === "Processando" || status === "Retentando...") {
    return (
      <div
        style={{
          width: 16,
          height: 16,
          border: `2px solid ${corStatus(status)}`,
          borderTopColor: "transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          flexShrink: 0,
        }}
      />
    );
  }
  if (status === "Erro") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  }
  // Aguardando
  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "#334155",
        border: "2px solid #475569",
        flexShrink: 0,
      }}
    />
  );
}

export default function PipelineProjeto({ projetoId }: Props) {
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      const data = await buscarPipelineProjeto(projetoId);
      setEtapas(Array.isArray(data) ? data.map(d => ({ ...d, icone: ICONES_ETAPA[d.etapa] ?? "⚙️" })) : []);
    } catch {
      // silencioso
    } finally {
      setCarregando(false);
    }
  }, [projetoId]);

  const syncWithAPI = useCallback(async () => {
    // Apenas tenta sincronizar se tiver algo processando
    try {
      await fetch("/api/odm/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projetoId })
      });
    } catch {
      // silencioso
    }
  }, [projetoId]);

  useEffect(() => {
    carregar();

    // Polling leve: checa o banco a cada 5s
    const intervaloCarregar = setInterval(carregar, 5000);
    // Sync pesado com a API a cada 10s (que por sua vez checa o NodeODM e dispara a IA)
    const intervaloSync = setInterval(syncWithAPI, 10000);

    // Realtime: escutar mudanças no job da missão
    const channel = supabase
      .channel(`pipeline-${projetoId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mission_jobs",
          filter: `projeto_id=eq.${projetoId}`,
        },
        () => carregar()
      )
      .subscribe();

    return () => {
      clearInterval(intervaloCarregar);
      clearInterval(intervaloSync);
      supabase.removeChannel(channel);
    };
  }, [projetoId, carregar, syncWithAPI]);

  const ativas = etapas.filter((e) => e.status !== "Aguardando").length;
  const concluidas = etapas.filter((e) => e.status === "Concluído").length;
  const total = etapas.length;
  const progresso_geral = total > 0 ? Math.round((concluidas / total) * 100) : 0;
  const processando = etapas.some((e) => e.status === "Processando" || e.status === "Retentando...");
  const temErro = etapas.some((e) => e.status === "Erro");

  if (carregando) {
    return (
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: 24 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div className="skeleton" style={{ width: 24, height: 24, borderRadius: 6 }} />
          <div className="skeleton" style={{ width: 160, height: 20, borderRadius: 4 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: 24 }}>
      {/* Cabeçalho */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
            ⚙️ Pipeline de Processamento
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {concluidas}/{total} etapas concluídas
          </p>
        </div>

        {/* Status geral */}
        <div
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            background: temErro
              ? "rgba(239,68,68,0.1)"
              : processando
              ? "rgba(59,130,246,0.1)"
              : concluidas === total && total > 0
              ? "rgba(34,197,94,0.1)"
              : "rgba(71,85,105,0.1)",
            color: temErro
              ? "#ef4444"
              : processando
              ? "#60a5fa"
              : concluidas === total && total > 0
              ? "#4ade80"
              : "#94a3b8",
            border: `1px solid ${
              temErro ? "rgba(239,68,68,0.2)" : processando ? "rgba(59,130,246,0.2)" : concluidas === total && total > 0 ? "rgba(34,197,94,0.2)" : "rgba(71,85,105,0.2)"
            }`,
          }}
        >
          {temErro ? "❌ Erro" : processando ? "🔄 Processando..." : concluidas === total && total > 0 ? "✅ Concluído" : "⏳ Aguardando"}
        </div>
      </div>

      {/* Barra geral */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>PROGRESSO GERAL</span>
          <span style={{ fontSize: 11, color: progresso_geral === 100 ? "#22c55e" : "var(--text-secondary)", fontWeight: 700 }}>
            {progresso_geral}%
          </span>
        </div>
        <div style={{ height: 6, background: "var(--bg-surface)", borderRadius: 999, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              borderRadius: 999,
              background: temErro
                ? "linear-gradient(90deg, #ef4444, #dc2626)"
                : progresso_geral === 100
                ? "linear-gradient(90deg, #22c55e, #16a34a)"
                : "linear-gradient(90deg, #3b82f6, #1d4ed8)",
              width: `${progresso_geral}%`,
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* Etapas */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {etapas.map((etapa, index) => {
          const animando = etapa.status === "Processando" || etapa.status === "Retentando...";
          const iconeEtapa = ICONES_ETAPA[etapa.etapa] ?? "🔹";

          return (
            <div
              key={etapa.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                background:
                  etapa.status === "Aguardando"
                    ? "transparent"
                    : bgStatus(etapa.status),
                border: `1px solid ${
                  etapa.status === "Aguardando"
                    ? "transparent"
                    : `${corStatus(etapa.status)}25`
                }`,
                transition: "all 0.3s ease",
              }}
            >
              {/* Número / Ícone de status */}
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>
                {iconeStatus(etapa.status, animando)}
              </div>

              {/* Emoji da etapa */}
              <span style={{ fontSize: 16, flexShrink: 0 }}>{iconeEtapa}</span>

              {/* Nome */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: etapa.status === "Aguardando" ? "var(--text-muted)" : "var(--text-primary)",
                  }}
                >
                  {etapa.etapa}
                </div>
                {etapa.progresso > 0 && etapa.progresso < 100 && (
                  <div style={{ marginTop: 4, height: 3, background: "var(--bg-surface)", borderRadius: 999, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        background: corStatus(etapa.status),
                        width: `${etapa.progresso}%`,
                        borderRadius: 999,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Status badge */}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: corStatus(etapa.status),
                  whiteSpace: "nowrap",
                }}
              >
                {etapa.status === "Concluído" ? "✓ Concluído" :
                 etapa.status === "Processando" ? `${etapa.progresso}%` :
                 etapa.status === "Erro" ? "Falhou" :
                 etapa.status === "Retentando..." ? "Retentando" :
                 "Aguardando"}
              </div>
            </div>
          );
        })}
      </div>

      {etapas.length === 0 && (
        <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
          Pipeline será iniciado após o upload das fotos.
        </p>
      )}
    </div>
  );
}
