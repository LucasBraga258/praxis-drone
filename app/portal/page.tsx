import Link from "next/link";

export default function PortalIndexPage() {
  return (
    <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
      <div
        style={{
          width: 64,
          height: 64,
          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          boxShadow: "0 8px 24px rgba(34,197,94,0.3)",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="2" />
          <path d="M12 10V6" /><path d="M12 18v-6" />
          <path d="M10 12H6" /><path d="M18 12h-6" />
          <path d="M5.05 5.05l1.41 1.41" /><path d="M17.54 6.46l1.41-1.41" />
          <path d="M5.05 18.95l1.41-1.41" /><path d="M17.54 17.54l1.41 1.41" />
        </svg>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 12 }}>
        Portal do Cliente
      </h1>
      <p style={{ fontSize: 14.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 32 }}>
        Acesse o portal da sua propriedade com o link enviado pelo seu agrônomo responsável,
        ou use o código de acesso fornecido.
      </p>
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--bg-border)",
          borderRadius: "var(--radius-xl)",
          padding: 24,
        }}
      >
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
          Exemplo: <code style={{ color: "#4ade80", background: "rgba(34,197,94,0.1)", padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>/portal/fazenda-boa-esperanca</code>
        </p>
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 24px",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "#fff",
            borderRadius: "var(--radius-md)",
            fontSize: 13.5,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Acessar Plataforma Interna
        </Link>
      </div>
    </div>
  );
}
