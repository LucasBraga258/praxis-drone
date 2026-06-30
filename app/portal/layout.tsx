import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal do Cliente — Praxis Agricultura de Precisão",
  description: "Acompanhe em tempo real suas fazendas, talhões, missões e laudos agronômicos.",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Header do Portal */}
      <header
        style={{
          height: 64,
          background: "rgba(6, 15, 27, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--bg-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(34,197,94,0.3)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="2" />
              <path d="M12 10V6" /><path d="M12 18v-6" />
              <path d="M10 12H6" /><path d="M18 12h-6" />
              <path d="M5.05 5.05l1.41 1.41" /><path d="M17.54 6.46l1.41-1.41" />
              <path d="M5.05 18.95l1.41-1.41" /><path d="M17.54 17.54l1.41 1.41" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", lineHeight: 1.2 }}>Praxis</div>
            <div style={{ fontSize: 9.5, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Portal do Cliente
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
          Área exclusiva do produtor
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--bg-border)",
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 80,
        }}
      >
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} Praxis Agricultura de Precisão. Todos os direitos reservados.
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Desenvolvido com ❤️ para o produtor rural brasileiro
        </div>
      </footer>
    </div>
  );
}
