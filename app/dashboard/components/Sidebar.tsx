"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

// ─── Ícones ─────────────────────────────────────────────────

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function SeedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10" /><path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 1 1.5 4.6c-1.9.3-3.5 0-4.8-1-1.2-.8-2.1-2.3-2.6-4.7 2.7-.3 4.4.2 5.9 1.1z" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

function DroneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10V6" /><path d="M12 18v-6" />
      <path d="M10 12H6" /><path d="M18 12h-6" />
      <path d="M5.05 5.05l1.41 1.41" /><path d="M17.54 6.46l1.41-1.41" />
      <path d="M5.05 18.95l1.41-1.41" /><path d="M17.54 17.54l1.41 1.41" />
    </svg>
  );
}

function FlaskIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6" /><path d="M10 3v8l-4.9 7.35A1 1 0 0 0 6 20h12a1 1 0 0 0 .9-1.45L14 11.01V3" />
    </svg>
  );
}

function BugIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8 2 1.88 1.88" /><path d="M14.12 3.88 16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" /><path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" /><path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" /><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="9" width="18" height="12" /><path d="M8 21V9l4-6 4 6v12" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: open ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ─── Componente de Link simples ──────────────────────────────

function NavLink({ href, icon, label, badge, sub }: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  sub?: boolean;
}) {
  const pathname = usePathname();
  const isActive = href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn("praxis-nav-link", isActive && "active")}
      style={sub ? { paddingLeft: 32, fontSize: 13 } : undefined}
    >
      {icon}
      <span style={{ flex: 1 }}>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span style={{
          fontSize: 10, background: "#ef4444", color: "#fff",
          borderRadius: 999, width: 18, height: 18,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, flexShrink: 0,
        }}>
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

// ─── Fazendas (expandível) ──────────────────────────────────

function FazendasMenu() {
  const pathname = usePathname();
  const isFazendaAtiva =
    pathname.startsWith("/dashboard/fazendas") ||
    pathname.startsWith("/dashboard/talhoes") ||
    pathname.startsWith("/dashboard/projetos");

  const [aberto, setAberto] = useState(isFazendaAtiva);

  return (
    <div>
      {/* Item pai: Fazendas */}
      <button
        onClick={() => setAberto((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "9px 12px",
          borderRadius: "var(--radius-md)",
          color: isFazendaAtiva ? "var(--praxis-green-400)" : "var(--text-secondary)",
          fontSize: 13.5,
          fontWeight: 500,
          transition: "all 0.15s ease",
          background: isFazendaAtiva ? "rgba(34, 197, 94, 0.1)" : "transparent",
          border: isFazendaAtiva ? "1px solid rgba(34, 197, 94, 0.15)" : "1px solid transparent",
          width: "100%",
          cursor: "pointer",
          marginBottom: 2,
        }}
      >
        <SeedIcon />
        <span style={{ flex: 1, textAlign: "left" }}>Fazendas</span>
        <ChevronIcon open={aberto} />
      </button>

      {/* Sub-itens */}
      {aberto && (
        <div
          style={{
            marginLeft: 8,
            paddingLeft: 12,
            borderLeft: "1px solid var(--bg-border)",
            marginTop: 2,
            marginBottom: 4,
          }}
        >
          <NavLink
            href="/dashboard/fazendas"
            icon={<SeedIcon />}
            label="Todas as Fazendas"
            sub
          />
          <NavLink
            href="/dashboard/talhoes"
            icon={<MapIcon />}
            label="Talhões"
            sub
          />
          <NavLink
            href="/dashboard/projetos"
            icon={<DroneIcon />}
            label="Monitoramentos"
            sub
          />
        </div>
      )}
    </div>
  );
}

// ─── Sidebar Principal ───────────────────────────────────────

interface SidebarProps {
  notificacoes?: number;
  userProfile?: any;
}

export default function Sidebar({ notificacoes = 0, userProfile }: SidebarProps) {
  const isAdmin = !userProfile || userProfile?.perfil === "admin";
  const isEmpresa = userProfile?.perfil === "empresa";
  const isAgronomo = userProfile?.perfil === "agronomo";
  const isProdutor = userProfile?.perfil === "produtor";

  return (
    <aside className="praxis-sidebar">
      {/* Logo */}
      <div className="praxis-sidebar-logo">
        <Link
          href="/dashboard"
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}
        >
          <div style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: "0 4px 12px rgba(34,197,94,0.35)",
          }}>
            <DroneIcon />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", lineHeight: 1.2 }}>Praxis</div>
            <div style={{ fontSize: 9.5, color: "#475569", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Agricultura de Precisão
            </div>
          </div>
        </Link>
      </div>

      {/* Navegação */}
      <nav className="praxis-sidebar-nav">

        {/* VISÃO GERAL */}
        <div className="praxis-nav-section">
          <div className="praxis-nav-label">Visão Geral</div>
          <NavLink href="/dashboard" icon={<GridIcon />} label="Dashboard" />
          <NavLink href="/dashboard/ia" icon={<SparkleIcon />} label="IA Praxis" />
          <NavLink href="/dashboard/relatorios" icon={<FileTextIcon />} label="Relatórios" />
        </div>

        {/* OPERAÇÕES */}
        {!isProdutor && (
          <div className="praxis-nav-section">
            <div className="praxis-nav-label">Operações</div>
            <FazendasMenu />
            <NavLink href="/dashboard/intervencoes" icon={<FlaskIcon />} label="Intervenções" />
            <NavLink href="/dashboard/pragas" icon={<BugIcon />} label="Pragas & Doenças" />
          </div>
        )}

        {/* GESTÃO */}
        {(isAdmin || isEmpresa) && (
          <div className="praxis-nav-section">
            <div className="praxis-nav-label">Gestão</div>
            <NavLink href="/dashboard/clientes" icon={<UsersIcon />} label="Produtores" />
            <NavLink href="/dashboard/agronomos" icon={<UserIcon />} label="Agrônomos" />
            {isAdmin && <NavLink href="/dashboard/empresas" icon={<BuildingIcon />} label="Empresas" />}
            {isAdmin && <NavLink href="/dashboard/usuarios" icon={<ShieldIcon />} label="Controle de Acessos" />}
            <NavLink href="/dashboard/alertas" icon={<BellIcon />} label="Alertas" badge={notificacoes} />
          </div>
        )}

        {/* SISTEMA */}
        {isAdmin && (
          <div className="praxis-nav-section">
            <div className="praxis-nav-label">Sistema</div>
            <NavLink href="/dashboard/configuracoes" icon={<SettingsIcon />} label="Configurações" />
          </div>
        )}

      </nav>

      <div style={{ padding: "16px 12px 24px", borderTop: "1px solid var(--bg-border)", display: "flex", flexDirection: "column", gap: 12 }}>
        
        {/* Portal do Cliente */}
        <div>
          <div className="praxis-nav-label" style={{ marginBottom: 8 }}>Portal</div>
          <Link
            href="/portal"
            className="praxis-nav-link"
            style={{
              border: "1px solid rgba(34,197,94,0.2)",
              background: "rgba(34,197,94,0.05)",
              color: "rgba(74,222,128,0.85)",
            }}
          >
            <ExternalIcon />
            <span style={{ fontSize: 12.5 }}>Ir para o Portal</span>
          </Link>
        </div>

        {/* Sair / Logout */}
        <button
          onClick={async () => {
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
          className="praxis-nav-link"
          style={{
            border: "1px solid rgba(239,68,68,0.2)",
            background: "rgba(239,68,68,0.05)",
            color: "rgba(248,113,113,0.85)",
            cursor: "pointer",
            width: "100%"
          }}
        >
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>Sair do Sistema</span>
        </button>

      </div>
    </aside>
  );
}