"use client";

/**
 * FarmTimeline — Linha do Tempo da Fazenda
 *
 * Exibe cronologicamente: monitoramentos, intervenções, pragas
 * Cada evento é clicável e navegável.
 *
 * Inspirado no conceito de "safra como narrativa":
 * 🌱 Plantio → 🚁 Monitoramento → 🧪 Intervenção → 📈 Resultado → 🌾 Colheita
 */

import Link from "next/link";

interface EventoTimeline {
  id: number | string;
  tipo: "monitoramento" | "intervencao" | "praga" | "marco";
  data: string;
  titulo: string;
  subtitulo?: string;
  status?: string;
  href?: string;
  destaque?: string; // ex: "+12% NDVI"
}

interface FarmTimelineProps {
  eventos: EventoTimeline[];
  fazendaNome: string;
}

const ICONE_TIPO: Record<string, string> = {
  monitoramento: "🚁",
  intervencao: "🧪",
  praga: "🐛",
  marco: "📌",
};

const COR_TIPO: Record<string, string> = {
  monitoramento: "#22c55e",
  intervencao: "#3b82f6",
  praga: "#f59e0b",
  marco: "#8b5cf6",
};

const BG_TIPO: Record<string, string> = {
  monitoramento: "rgba(34,197,94,0.1)",
  intervencao: "rgba(59,130,246,0.1)",
  praga: "rgba(245,158,11,0.1)",
  marco: "rgba(139,92,246,0.1)",
};

function formatarData(data: string): string {
  const d = new Date(data + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function EventoCard({ evento, isLast }: { evento: EventoTimeline; isLast: boolean }) {
  const cor = COR_TIPO[evento.tipo] ?? "#475569";
  const bg = BG_TIPO[evento.tipo] ?? "rgba(71,85,105,0.1)";
  const icone = ICONE_TIPO[evento.tipo] ?? "📌";

  const inner = (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 14px",
        background: bg,
        border: `1px solid ${cor}25`,
        borderRadius: 12,
        transition: "all 0.15s",
        cursor: evento.href ? "pointer" : "default",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* Ícone */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: bg,
          border: `1.5px solid ${cor}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {icone}
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
          {evento.titulo}
        </div>
        {evento.subtitulo && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
            {evento.subtitulo}
          </div>
        )}
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {formatarData(evento.data)}
        </div>
      </div>

      {/* Destaque (ex: +12% NDVI) */}
      {evento.destaque && (
        <div
          style={{
            alignSelf: "center",
            fontSize: 11,
            fontWeight: 700,
            color: cor,
            background: bg,
            border: `1px solid ${cor}30`,
            borderRadius: 999,
            padding: "3px 8px",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {evento.destaque}
        </div>
      )}
    </div>
  );

  if (evento.href) {
    return (
      <div style={{ position: "relative" }}>
        {/* Linha conectora */}
        {!isLast && (
          <div
            style={{
              position: "absolute",
              left: 29,
              top: 48,
              width: 1,
              height: 16,
              background: "var(--bg-border)",
            }}
          />
        )}
        <Link href={evento.href} style={{ textDecoration: "none", display: "block" }}>
          {inner}
        </Link>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {!isLast && (
        <div
          style={{
            position: "absolute",
            left: 29,
            top: 48,
            width: 1,
            height: 16,
            background: "var(--bg-border)",
          }}
        />
      )}
      {inner}
    </div>
  );
}

export default function FarmTimeline({ eventos, fazendaNome }: FarmTimelineProps) {
  if (eventos.length === 0) {
    return (
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--bg-border)",
          borderRadius: "var(--radius-xl)",
          padding: 24,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
          📅 Linha do Tempo
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Nenhum evento registrado para esta fazenda ainda.
          <br />
          Crie um monitoramento ou registre uma intervenção para iniciar a linha do tempo.
        </p>
      </div>
    );
  }

  // Agrupar por ano/safra
  const porAno: Record<string, EventoTimeline[]> = {};
  for (const evento of eventos) {
    const ano = evento.data?.slice(0, 4) ?? "—";
    if (!porAno[ano]) porAno[ano] = [];
    porAno[ano].push(evento);
  }

  const anos = Object.keys(porAno).sort((a, b) => Number(b) - Number(a));

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--bg-border)",
        borderRadius: "var(--radius-xl)",
        padding: 24,
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>
        📅 Linha do Tempo — {fazendaNome}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {anos.map((ano) => (
          <div key={ano}>
            {/* Header do ano */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Safra {ano}
              </div>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "var(--bg-border)",
                }}
              />
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                }}
              >
                {porAno[ano].length} evento{porAno[ano].length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Eventos do ano */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {porAno[ano].map((evento, i) => (
                <EventoCard
                  key={evento.id}
                  evento={evento}
                  isLast={i === porAno[ano].length - 1}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
