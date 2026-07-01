import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export default async function PortalClientePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Buscar fazenda pelo slug (nome normalizado) ou ID
  const slugIsId = /^\d+$/.test(slug);

  const query = supabase
    .from("fazendas")
    .select(`
      *,
      clientes!fazendas_cliente_id_fkey(id, nome, email),
      talhoes(id, nome, cultura, area, safra)
    `);

  const { data: fazenda } = slugIsId
    ? await query.eq("id", slug).single()
    : await query.ilike("nome", slug.replace(/-/g, " ")).single();

  if (!fazenda) return notFound();

  // Missões recentes
  const { data: missoes } = await supabase
    .from("projetos")
    .select("id, codigo, status, data_voo, area_mapeada, ndvi_url, pdf_url, alto_vigor, medio_vigor, baixo_vigor")
    .eq("fazenda_id", fazenda.id)
    .order("data_voo", { ascending: false })
    .limit(10);

  // Intervenções recentes
  const { data: intervencoes } = await supabase
    .from("intervencoes")
    .select("id, tipo, produto, data_intervencao, dose, responsavel")
    .eq("fazenda_id", fazenda.id)
    .order("data_intervencao", { ascending: false })
    .limit(5);

  const cliente = Array.isArray(fazenda.clientes) ? fazenda.clientes[0] : fazenda.clientes;
  const talhoes = Array.isArray(fazenda.talhoes) ? fazenda.talhoes : [];
  const totalArea = talhoes.reduce((s: number, t: { area: number | null }) => s + (Number(t.area) || 0), 0);

  const ultimaMissao = missoes?.[0];
  const statusColors: Record<string, string> = {
    Concluído: "#22c55e",
    Processando: "#3b82f6",
    Erro: "#ef4444",
    Upload: "#f59e0b",
    Analisando: "#a78bfa",
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>

      {/* Hero */}
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: "var(--radius-2xl)",
          border: "1px solid var(--bg-border)",
          padding: "40px 40px 32px",
          marginBottom: 28,
          position: "relative",
          overflow: "hidden",
        }}
        className="portal-hero"
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <p style={{ fontSize: 12.5, color: "var(--praxis-green-400)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>
              Portal do Produtor
            </p>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1, marginBottom: 8 }}>
              {fazenda.nome}
            </h1>
            {cliente && (
              <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                Produtor: <strong style={{ color: "var(--text-primary)" }}>{cliente.nome}</strong>
              </p>
            )}
            {fazenda.municipio && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                📍 {fazenda.municipio}{fazenda.uf ? `, ${fazenda.uf}` : ""}
              </p>
            )}
          </div>

          {/* Saúde Badge */}
          {fazenda.status_saude && (
            <div
              style={{
                padding: "16px 24px",
                background:
                  fazenda.status_saude === "Saudável"
                    ? "rgba(34,197,94,0.1)"
                    : fazenda.status_saude === "Atenção"
                    ? "rgba(245,158,11,0.1)"
                    : "rgba(239,68,68,0.1)",
                border: `1px solid ${
                  fazenda.status_saude === "Saudável"
                    ? "rgba(34,197,94,0.25)"
                    : fazenda.status_saude === "Atenção"
                    ? "rgba(245,158,11,0.25)"
                    : "rgba(239,68,68,0.25)"
                }`,
                borderRadius: "var(--radius-xl)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color:
                    fazenda.status_saude === "Saudável"
                      ? "#4ade80"
                      : fazenda.status_saude === "Atenção"
                      ? "#fbbf24"
                      : "#f87171",
                  marginBottom: 4,
                }}
              >
                {fazenda.status_saude === "Saudável" ? "●" : fazenda.status_saude === "Atenção" ? "◐" : "○"}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>
                {fazenda.status_saude}
              </div>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: 32, marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--bg-border)", flexWrap: "wrap" }}>
          {[
            { label: "Área Total", value: `${Number(fazenda.area_ha || 0).toLocaleString("pt-BR")} ha` },
            { label: "Talhões", value: talhoes.length },
            { label: "Missões", value: missoes?.length || 0 },
            { label: "Cultura", value: fazenda.cultura || "—" },
            { label: "Próximo Voo", value: fazenda.proximo_voo ? new Date(fazenda.proximo_voo).toLocaleDateString("pt-BR") : "—" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 4 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Última Missão + Talhões */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>

        {/* Última Missão */}
        {ultimaMissao && (
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--bg-border)",
              borderRadius: "var(--radius-xl)",
              padding: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
              <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Último Monitoramento</h2>
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
              {ultimaMissao.codigo}
            </p>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 16 }}>
              {ultimaMissao.data_voo ? new Date(ultimaMissao.data_voo).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }) : "—"}
            </p>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  background: `${statusColors[ultimaMissao.status] || "#475569"}20`,
                  color: statusColors[ultimaMissao.status] || "#94a3b8",
                  padding: "3px 10px",
                  borderRadius: 999,
                }}
              >
                {ultimaMissao.status}
              </span>
              {ultimaMissao.area_mapeada && (
                <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                  {Number(ultimaMissao.area_mapeada).toLocaleString("pt-BR")} ha
                </span>
              )}
            </div>

            {/* Vigor Vegetativo */}
            {(ultimaMissao.alto_vigor || ultimaMissao.medio_vigor || ultimaMissao.baixo_vigor) && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Vigor Vegetativo
                </p>
                <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", height: 8 }}>
                  <div style={{ flex: ultimaMissao.alto_vigor || 0, background: "#22c55e" }} />
                  <div style={{ flex: ultimaMissao.medio_vigor || 0, background: "#f59e0b" }} />
                  <div style={{ flex: ultimaMissao.baixo_vigor || 0, background: "#ef4444" }} />
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  {[
                    { label: "Alto", value: ultimaMissao.alto_vigor, cor: "#4ade80" },
                    { label: "Médio", value: ultimaMissao.medio_vigor, cor: "#fbbf24" },
                    { label: "Baixo", value: ultimaMissao.baixo_vigor, cor: "#f87171" },
                  ].map((v) => (
                    <div key={v.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: v.cor }}>{v.value || 0}%</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{v.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ultimaMissao.pdf_url && (
              <a
                href={ultimaMissao.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  color: "#fff",
                  borderRadius: "var(--radius-md)",
                  fontSize: 12.5,
                  fontWeight: 600,
                  textDecoration: "none",
                  boxShadow: "0 2px 8px rgba(34,197,94,0.3)",
                }}
              >
                📥 Baixar Relatório PDF
              </a>
            )}
          </div>
        )}

        {/* Talhões */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--bg-border)",
            borderRadius: "var(--radius-xl)",
            padding: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa" }} />
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Talhões</h2>
          </div>
          {talhoes.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Nenhum talhão cadastrado.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {talhoes.map((t: { id: number; nome: string; cultura: string | null; area: number | null; safra: string | null }) => (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "var(--bg-surface)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--bg-border)",
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{t.nome}</p>
                    {t.cultura && <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.cultura} {t.safra ? `· Safra ${t.safra}` : ""}</p>}
                  </div>
                  {t.area && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa" }}>
                      {Number(t.area).toLocaleString("pt-BR")} ha
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--bg-border)", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Área total dos talhões</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>
              {totalArea.toLocaleString("pt-BR")} ha
            </span>
          </div>
        </div>
      </div>

      {/* Histórico de Missões */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--bg-border)",
          borderRadius: "var(--radius-xl)",
          padding: 24,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Histórico de Monitoramentos</h2>
          <Link
            href={`/portal/${slug}/missoes`}
            style={{ fontSize: 12, color: "#4ade80", textDecoration: "none", fontWeight: 600 }}
          >
            Ver todos →
          </Link>
        </div>
        {(!missoes || missoes.length === 0) ? (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Nenhum monitoramento realizado ainda.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="praxis-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Data do Voo</th>
                  <th>Status</th>
                  <th>Área</th>
                  <th>Relatório</th>
                </tr>
              </thead>
              <tbody>
                {missoes.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{m.codigo}</td>
                    <td>{m.data_voo ? new Date(m.data_voo).toLocaleDateString("pt-BR") : "—"}</td>
                    <td>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          background: `${statusColors[m.status] || "#475569"}20`,
                          color: statusColors[m.status] || "#94a3b8",
                          padding: "2px 10px",
                          borderRadius: 999,
                        }}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td>{m.area_mapeada ? `${m.area_mapeada} ha` : "—"}</td>
                    <td>
                      {m.pdf_url ? (
                        <a
                          href={m.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#4ade80", fontSize: 12, textDecoration: "none", fontWeight: 600 }}
                        >
                          📥 PDF
                        </a>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Intervenções */}
      {intervencoes && intervencoes.length > 0 && (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--bg-border)",
            borderRadius: "var(--radius-xl)",
            padding: 24,
          }}
        >
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            Intervenções Realizadas
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {intervencoes.map((i) => (
              <div
                key={i.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 16px",
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--bg-border)",
                }}
              >
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {i.tipo || "Intervenção"}
                  </p>
                  <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
                    {i.produto} {i.dose ? `· ${i.dose}` : ""} {i.responsavel ? `· ${i.responsavel}` : ""}
                  </p>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {i.data_intervencao ? new Date(i.data_intervencao).toLocaleDateString("pt-BR") : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
