"use client";

import Link from "next/link";
import { useState } from "react";

interface Talhao {
  id: number;
  nome: string;
  cultura: string | null;
  area: number | null;
}

interface Fazenda {
  id: number;
  nome: string;
  area_ha: number | null;
  status_saude: string | null;
  cultura: string | null;
  proximo_voo: string | null;
  talhoes: Talhao[] | Talhao | null;
}

interface Props {
  fazendas: Fazenda[];
}

const saudeConfig: Record<string, { cor: string; bg: string; label: string }> = {
  Saudável:  { cor: "#4ade80", bg: "rgba(34,197,94,0.12)",   label: "Saudável" },
  "Atenção": { cor: "#fbbf24", bg: "rgba(245,158,11,0.12)",  label: "Atenção" },
  Crítica:   { cor: "#f87171", bg: "rgba(239,68,68,0.12)",   label: "Crítica" },
};

function SeedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10" /><path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: "transform 0.2s", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function FazendaRow({ fazenda }: { fazenda: Fazenda }) {
  const [aberto, setAberto] = useState(false);
  const talhoes = Array.isArray(fazenda.talhoes)
    ? fazenda.talhoes
    : fazenda.talhoes
    ? [fazenda.talhoes]
    : [];

  const saude = fazenda.status_saude ? saudeConfig[fazenda.status_saude] : null;

  return (
    <div>
      {/* Linha da Fazenda */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          background: aberto ? "var(--bg-hover)" : "transparent",
          borderRadius: "var(--radius-md)",
          transition: "background 0.15s",
          cursor: "pointer",
        }}
        onClick={() => setAberto(!aberto)}
      >
        {/* Toggle */}
        <div style={{ color: "var(--text-muted)", flexShrink: 0 }}>
          {talhoes.length > 0 ? <ChevronIcon open={aberto} /> : <span style={{ width: 14 }} />}
        </div>

        {/* Icon */}
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "rgba(139,92,246,0.1)",
            color: "#a78bfa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <SeedIcon />
        </div>

        {/* Name */}
        <Link
          href={`/dashboard/fazendas/${fazenda.id}`}
          style={{
            flex: 1,
            fontWeight: 600,
            fontSize: 13.5,
            color: "var(--text-primary)",
            textDecoration: "none",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {fazenda.nome}
        </Link>

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {fazenda.cultura && (
            <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 500 }}>
              {fazenda.cultura}
            </span>
          )}
          {fazenda.area_ha && (
            <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
              {Number(fazenda.area_ha).toLocaleString("pt-BR")} ha
            </span>
          )}
          {talhoes.length > 0 && (
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                background: "rgba(99,102,241,0.12)",
                color: "#818cf8",
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              {talhoes.length} talhões
            </span>
          )}
          {saude && (
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                background: saude.bg,
                color: saude.cor,
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              {saude.label}
            </span>
          )}
        </div>
      </div>

      {/* Talhões (expandidos) */}
      {aberto && talhoes.length > 0 && (
        <div style={{ paddingLeft: 44, marginTop: 2 }}>
          {talhoes.map((talhao) => (
            <div key={talhao.id} style={{ position: "relative" }}>
              {/* Vertical line */}
              <div
                style={{
                  position: "absolute",
                  left: 2,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: "var(--bg-border)",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px 9px 16px",
                  marginLeft: 8,
                  borderRadius: "var(--radius-md)",
                  transition: "background 0.15s",
                }}
              >
                {/* Connector dot */}
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "rgba(34,197,94,0.4)",
                    flexShrink: 0,
                  }}
                />

                {/* Talhão icon */}
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: "rgba(34,197,94,0.08)",
                    color: "#4ade80",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <MapPinIcon />
                </div>

                <Link
                  href={`/dashboard/talhoes/${talhao.id}`}
                  style={{
                    flex: 1,
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                  }}
                >
                  {talhao.nome}
                </Link>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {talhao.cultura && (
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {talhao.cultura}
                    </span>
                  )}
                  {talhao.area && (
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {Number(talhao.area).toLocaleString("pt-BR")} ha
                    </span>
                  )}
                  <Link
                    href={`/dashboard/projetos/novo?talhao_id=${talhao.id}&fazenda_id=${fazenda.id}`}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#4ade80",
                      background: "rgba(34,197,94,0.08)",
                      padding: "2px 10px",
                      borderRadius: 999,
                      textDecoration: "none",
                      border: "1px solid rgba(34,197,94,0.15)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    + Missão
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Add Talhão */}
          <Link
            href={`/dashboard/talhoes/novo?fazenda_id=${fazenda.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 12px 7px 28px",
              marginLeft: 8,
              fontSize: 12,
              color: "var(--text-muted)",
              textDecoration: "none",
              borderRadius: "var(--radius-md)",
              transition: "color 0.15s",
            }}
          >
            <span>+</span>
            <span>Adicionar talhão</span>
          </Link>
        </div>
      )}

      {/* No talhoes empty state */}
      {aberto && talhoes.length === 0 && (
        <div style={{ paddingLeft: 52, paddingBottom: 8 }}>
          <Link
            href={`/dashboard/talhoes/novo?fazenda_id=${fazenda.id}`}
            style={{
              fontSize: 12,
              color: "#4ade80",
              textDecoration: "none",
              background: "rgba(34,197,94,0.06)",
              padding: "6px 14px",
              borderRadius: 8,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid rgba(34,197,94,0.15)",
            }}
          >
            + Cadastrar primeiro talhão
          </Link>
        </div>
      )}
    </div>
  );
}

export default function DashboardHierarchy({ fazendas }: Props) {
  if (fazendas.length === 0) {
    return (
      <div className="praxis-card" style={{ padding: 32, textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          Nenhuma fazenda cadastrada ainda.
        </p>
        <Link href="/dashboard/fazendas/novo" className="btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
          + Cadastrar Fazenda
        </Link>
      </div>
    );
  }

  return (
    <div className="praxis-card">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "1px solid var(--bg-border)",
        }}
      >
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
            Fazendas · Talhões · Missões
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Hierarquia completa da propriedade — clique na fazenda para expandir os talhões
          </p>
        </div>
        <Link
          href="/dashboard/fazendas"
          style={{ fontSize: 12, color: "#4ade80", textDecoration: "none", fontWeight: 600 }}
        >
          Ver todas →
        </Link>
      </div>

      {/* Table Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 16px",
          borderBottom: "1px solid var(--bg-border)",
        }}
      >
        <div style={{ width: 44 }} />
        <div style={{ flex: 1, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
          Propriedade
        </div>
        <div style={{ width: 200, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", textAlign: "right" }}>
          Informações
        </div>
      </div>

      {/* Fazendas */}
      <div style={{ padding: "8px 8px" }}>
        {fazendas.map((fazenda) => (
          <FazendaRow key={fazenda.id} fazenda={fazenda} />
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "12px 24px",
          borderTop: "1px solid var(--bg-border)",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Link href="/dashboard/fazendas/novo" className="btn-primary" style={{ fontSize: 12, padding: "7px 16px" }}>
          + Nova Fazenda
        </Link>
      </div>
    </div>
  );
}
