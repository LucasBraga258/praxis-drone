import { supabase } from "../../lib/supabase";
import { Toaster } from "sonner";
import Sidebar from "./components/Sidebar";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { count: notificacoesNaoLidas } = await supabase
    .from("notificacoes")
    .select("*", { count: "exact", head: true })
    .eq("lida", false);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      {/* Fixed Sidebar */}
      <Sidebar notificacoes={notificacoesNaoLidas ?? 0} />

      {/* Main area offset by sidebar */}
      <div className="praxis-main">
        {/* Top Header */}
        <header className="praxis-header">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Breadcrumb placeholder — children override if needed */}
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Praxis
              </span>
              <span>/</span>
              <span style={{ color: "var(--text-primary)" }}>Dashboard</span>
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Alerts */}
            <Link
              href="/dashboard/alertas"
              style={{
                position: "relative",
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-card)",
                border: "1px solid var(--bg-border)",
                color: "var(--text-secondary)",
                transition: "all 0.15s",
                textDecoration: "none",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {(notificacoesNaoLidas ?? 0) > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 7,
                    height: 7,
                    background: "#ef4444",
                    borderRadius: "50%",
                    border: "1.5px solid var(--bg-base)",
                  }}
                />
              )}
            </Link>

            {/* Divider */}
            <div
              style={{
                width: 1,
                height: 24,
                background: "var(--bg-border)",
                margin: "0 4px",
              }}
            />

            {/* User Avatar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 12px 6px 6px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-card)",
                border: "1px solid var(--bg-border)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                L
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    lineHeight: 1.2,
                  }}
                >
                  Lucas
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: "var(--text-muted)",
                    lineHeight: 1.2,
                  }}
                >
                  Administrador
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1 }}>{children}</main>

        <Toaster position="top-right" richColors />
      </div>
    </div>
  );
}