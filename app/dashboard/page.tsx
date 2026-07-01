import Link from "next/link";
import { carregarDashboard } from "../../lib/services/dashboard";
import { listarMissoes } from "../../lib/services/projetos";
import { createClient } from "@/lib/supabase/server";
import DashboardChartsServer from "./DashboardChartsServer";
import DashboardHierarchy from "./components/DashboardHierarchy";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const periodo = Number(params.periodo || "30");

  // Carregar via service (Promise.all, sem N+1)
  const dados = await carregarDashboard(periodo);

  // Missões em processamento
  const todasMissoes = await listarMissoes();
  const missoesProcessando = todasMissoes.filter(
    (m) =>
      m.status === "Processando" || m.status === "Upload" || m.status === "Analisando"
  );
  const missoesComErro = todasMissoes.filter((m) => m.status === "Erro");

  // Hierarquia: Fazendas com seus Talhões
  const { data: fazendas } = await supabase
    .from("fazendas")
    .select("id, nome, area_ha, status_saude, cultura, proximo_voo, talhoes(id, nome, cultura, area)")
    .order("nome")
    .limit(5);

  const periodos = [
    { valor: 7, label: "7 dias" },
    { valor: 30, label: "30 dias" },
    { valor: 90, label: "90 dias" },
    { valor: 365, label: "12 meses" },
  ];

  // KPIs calculados
  const taxaConclusao =
    dados.projetos > 0
      ? Math.round(((dados.projetos - missoesComErro.length) / dados.projetos) * 100)
      : 100;

  const stats = [
    {
      label: "Área Monitorada",
      value: dados.areaMonitorada.toLocaleString("pt-BR"),
      unit: "ha",
      icon: AreaIcon,
      color: "#22c55e",
      bg: "rgba(34,197,94,0.1)",
      href: "/dashboard/fazendas",
      trend: null,
    },
    {
      label: "Missões no Período",
      value: dados.projetos,
      unit: null,
      icon: DroneStatIcon,
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.1)",
      href: "/dashboard/projetos",
      trend: null,
    },
    {
      label: "Fazendas Ativas",
      value: dados.fazendas,
      unit: null,
      icon: FarmIcon,
      color: "#8b5cf6",
      bg: "rgba(139,92,246,0.1)",
      href: "/dashboard/fazendas",
      trend: null,
    },
    {
      label: "Clientes",
      value: dados.clientes,
      unit: null,
      icon: ClientIcon,
      color: "#06b6d4",
      bg: "rgba(6,182,212,0.1)",
      href: "/dashboard/clientes",
      trend: null,
    },
    {
      label: "Taxa de Conclusão",
      value: taxaConclusao,
      unit: "%",
      icon: CheckIcon,
      color: "#22c55e",
      bg: "rgba(34,197,94,0.1)",
      href: "/dashboard/projetos",
      trend: taxaConclusao >= 90 ? "good" : taxaConclusao >= 70 ? "warn" : "bad",
    },
    {
      label: "Alertas Pendentes",
      value: dados.alertasPendentes,
      unit: null,
      icon: AlertIcon,
      color: dados.alertasPendentes > 0 ? "#ef4444" : "#22c55e",
      bg: dados.alertasPendentes > 0 ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
      href: "/dashboard/alertas",
      trend: dados.alertasPendentes > 0 ? "bad" : "good",
    },
    {
      label: "Pragas Ativas",
      value: dados.pragasAtivas,
      unit: null,
      icon: BugStatIcon,
      color: dados.pragasAtivas > 0 ? "#f59e0b" : "#22c55e",
      bg: dados.pragasAtivas > 0 ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)",
      href: "/dashboard/pragas",
      trend: null,
    },
    {
      label: "Agrônomos",
      value: dados.agronomos,
      unit: null,
      icon: AgroIcon,
      color: "#a78bfa",
      bg: "rgba(167,139,250,0.1)",
      href: "/dashboard/agronomos",
      trend: null,
    },
  ];

  return (
    <div className="praxis-content">

      {/* Page Header */}
      <div style={{ marginBottom: 28 }} className="animate-fade-in">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
              Dashboard Executivo
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Period Filter */}
          <div style={{ display: "flex", gap: 4, background: "var(--bg-card)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", padding: 4 }}>
            {periodos.map((p) => (
              <Link
                key={p.valor}
                href={`/dashboard?periodo=${p.valor}`}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "all 0.15s",
                  background: periodo === p.valor ? "linear-gradient(135deg, #22c55e, #16a34a)" : "transparent",
                  color: periodo === p.valor ? "#fff" : "var(--text-secondary)",
                }}
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 28,
        }}
        className="animate-fade-in-delay-1"
      >
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="praxis-stat-card"
            style={{ textDecoration: "none", display: "block" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "var(--radius-md)",
                  background: stat.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: stat.color,
                }}
              >
                <stat.icon />
              </div>
              {stat.trend && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background:
                      stat.trend === "good"
                        ? "rgba(34,197,94,0.12)"
                        : stat.trend === "warn"
                        ? "rgba(245,158,11,0.12)"
                        : "rgba(239,68,68,0.12)",
                    color:
                      stat.trend === "good"
                        ? "#4ade80"
                        : stat.trend === "warn"
                        ? "#fbbf24"
                        : "#f87171",
                  }}
                >
                  {stat.trend === "good" ? "● OK" : stat.trend === "warn" ? "● Atenção" : "● Crítico"}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: stat.color,
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {stat.value}
              {stat.unit && (
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginLeft: 4 }}>
                  {stat.unit}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 500 }}>
              {stat.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Charts + Upcoming Flights Row */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 28 }}
        className="animate-fade-in-delay-2"
      >
        {/* Charts */}
        <DashboardChartsServer />

        {/* Próximos Monitoramentos */}
        <div className="praxis-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
              Próximos Monitoramentos
            </h2>
          </div>

          {dados.proximosVoos.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Nenhum monitoramento programado.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dados.proximosVoos.slice(0, 6).map((fazenda: { id: number; nome: string; proximo_voo: string }) => {
                const dias = Math.ceil(
                  (new Date(fazenda.proximo_voo).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <Link
                    key={fazenda.id}
                    href={`/dashboard/fazendas/${fazenda.id}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      background: "var(--bg-surface)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--bg-border)",
                      textDecoration: "none",
                      transition: "background 0.15s",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                        {fazenda.nome}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {new Date(fazenda.proximo_voo).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: dias < 0 ? "#f87171" : dias <= 7 ? "#fbbf24" : "#4ade80",
                        background: dias < 0 ? "rgba(239,68,68,0.1)" : dias <= 7 ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)",
                        padding: "3px 10px",
                        borderRadius: 999,
                      }}
                    >
                      {dias < 0 ? "Vencido" : `${dias}d`}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Hierarquia Fazendas → Talhões → Missões */}
      <div className="animate-fade-in-delay-3" style={{ marginBottom: 28 }}>
        <DashboardHierarchy fazendas={fazendas ?? []} />
      </div>

      {/* Processing + Alerts Row */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
        className="animate-fade-in-delay-4"
      >
        {/* Missões em Processamento */}
        <div className="praxis-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {missoesProcessando.length > 0 && (
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", display: "inline-block", animation: "pulse 2s infinite" }} />
              )}
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                Missões em Processamento
              </h2>
            </div>
            <span className="badge badge-blue">{missoesProcessando.length}</span>
          </div>
          {missoesProcessando.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Nenhuma missão em processamento.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {missoesProcessando.map((m) => (
                <Link
                  key={m.id}
                  href={`/dashboard/projetos/${m.id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "var(--bg-surface)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(59,130,246,0.2)",
                    textDecoration: "none",
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{m.codigo}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      {Array.isArray(m.fazendas) ? m.fazendas[0]?.nome : m.fazendas?.nome ?? "—"}
                    </p>
                  </div>
                  <span className="badge badge-blue">{m.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Alertas */}
        <div className="praxis-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
              Missões com Atenção
            </h2>
            <span className={`badge ${missoesComErro.length > 0 ? "badge-red" : "badge-green"}`}>
              {missoesComErro.length}
            </span>
          </div>
          {missoesComErro.length === 0 ? (
            <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "var(--radius-md)", padding: "16px 20px" }}>
              <p style={{ color: "#4ade80", fontSize: 13, fontWeight: 600 }}>✓ Tudo em ordem</p>
              <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>Nenhuma missão apresenta erros no momento.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {missoesComErro.slice(0, 5).map((m) => (
                <Link
                  key={m.id}
                  href={`/dashboard/projetos/${m.id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "rgba(239,68,68,0.06)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    textDecoration: "none",
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{m.codigo}</p>
                  <span className="badge badge-red">Erro</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SVG Icons (inline para evitar dependências)
   ============================================================ */

function AreaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function DroneStatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10V6" /><path d="M12 18v-6" />
      <path d="M10 12H6" /><path d="M18 12h-6" />
      <path d="M5.05 5.05l1.41 1.41" /><path d="M17.54 6.46l1.41-1.41" />
      <path d="M5.05 18.95l1.41-1.41" /><path d="M17.54 17.54l1.41 1.41" />
    </svg>
  );
}

function FarmIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10" /><path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
    </svg>
  );
}

function ClientIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function BugStatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="4" />
      <path d="M6 13H2" /><path d="M22 13h-4" />
      <path d="M12 9V5" /><path d="M9 6l-2-2" /><path d="M15 6l2-2" />
    </svg>
  );
}

function AgroIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}