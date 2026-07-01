import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function RelatoriosPage() {
  const supabase = await createClient();
  const [
    { data: missoes },
    { data: fazendas },
  ] = await Promise.all([
    supabase
      .from("projetos")
      .select("id, codigo, status, data_voo, area_mapeada, pdf_url, ndvi_url, ortomosaico_url, ndvi_img_url, ortomosaico_img_url, fazendas(nome)")
      .not("pdf_url", "is", null)
      .order("data_voo", { ascending: false }),
    supabase.from("fazendas").select("id, nome"),
  ]);

  // Todas as missões (para arquivos e mapas)
  const { data: todasMissoes } = await supabase
    .from("projetos")
    .select("id, codigo, status, data_voo, fazendas(nome), ndvi_url, ortomosaico_url, webgis_url")
    .in("status", ["Concluído"])
    .order("data_voo", { ascending: false });

  const totalRelatorios = missoes?.length || 0;
  const totalMapas = todasMissoes?.filter((m) => m.ndvi_url || m.ortomosaico_url).length || 0;

  return (
    <div className="praxis-content">
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
          Central de Relatórios
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          Todos os relatórios, mapas e produtos gerados pela plataforma
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Relatórios PDF", value: totalRelatorios, color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
          { label: "Mapas Disponíveis", value: totalMapas, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
          { label: "Fazendas", value: fazendas?.length || 0, color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
          { label: "Missões Concluídas", value: todasMissoes?.length || 0, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
        ].map((s) => (
          <div key={s.label} className="praxis-stat-card">
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Relatórios PDF */}
      <div className="praxis-card" style={{ marginBottom: 24 }}>
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
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
              Relatórios PDF
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              Relatórios técnicos e agronômicos gerados por missão
            </p>
          </div>
        </div>

        {(!missoes || missoes.length === 0) ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Nenhum relatório disponível ainda. Complete uma missão para gerar o primeiro relatório.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="praxis-table">
              <thead>
                <tr>
                  <th>Missão</th>
                  <th>Fazenda</th>
                  <th>Data</th>
                  <th>Área</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {missoes.map((m) => {
                  const fazenda = Array.isArray(m.fazendas) ? m.fazendas[0] : m.fazendas;
                  return (
                    <tr key={m.id}>
                      <td>
                        <Link
                          href={`/dashboard/projetos/${m.id}`}
                          style={{ fontWeight: 600, color: "var(--text-primary)", textDecoration: "none" }}
                        >
                          {m.codigo}
                        </Link>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{fazenda?.nome || "—"}</td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {m.data_voo ? new Date(m.data_voo).toLocaleDateString("pt-BR") : "—"}
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {m.area_mapeada ? `${m.area_mapeada} ha` : "—"}
                      </td>
                      <td>
                        <span className="badge badge-green">{m.status}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          {m.pdf_url && (
                            <a
                              href={m.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#4ade80",
                                background: "rgba(34,197,94,0.1)",
                                padding: "4px 12px",
                                borderRadius: 999,
                                textDecoration: "none",
                                border: "1px solid rgba(34,197,94,0.2)",
                              }}
                            >
                              📥 PDF
                            </a>
                          )}
                          {m.ndvi_url && (
                            <a
                              href={m.ndvi_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#60a5fa",
                                background: "rgba(59,130,246,0.1)",
                                padding: "4px 12px",
                                borderRadius: 999,
                                textDecoration: "none",
                                border: "1px solid rgba(59,130,246,0.2)",
                              }}
                            >
                              🗺 NDVI
                            </a>
                          )}
                          <Link
                            href={`/dashboard/projetos/${m.id}`}
                            style={{
                              fontSize: 12,
                              color: "var(--text-muted)",
                              padding: "4px 12px",
                              borderRadius: 999,
                              textDecoration: "none",
                              border: "1px solid var(--bg-border)",
                            }}
                          >
                            Ver Missão
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mapas e Produtos */}
      {todasMissoes && todasMissoes.length > 0 && (
        <div className="praxis-card">
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--bg-border)",
            }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
              Mapas e Produtos
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              Ortomosaicos, NDVI e WebGIS disponíveis para download
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, padding: 24 }}>
            {todasMissoes.filter((m) => m.ndvi_url || m.ortomosaico_url || m.webgis_url).map((m) => {
              const fazenda = Array.isArray(m.fazendas) ? m.fazendas[0] : m.fazendas;
              return (
                <div
                  key={m.id}
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--bg-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: 16,
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                    {m.codigo}
                  </p>
                  <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 12 }}>
                    {fazenda?.nome || "—"} · {m.data_voo ? new Date(m.data_voo).toLocaleDateString("pt-BR") : "—"}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {m.ortomosaico_url && (
                      <a
                        href={m.ortomosaico_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, color: "#4ade80", textDecoration: "none" }}
                      >
                        🌍 Ortomosaico
                      </a>
                    )}
                    {m.ndvi_url && (
                      <a
                        href={m.ndvi_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, color: "#60a5fa", textDecoration: "none" }}
                      >
                        🗺 NDVI
                      </a>
                    )}
                    {m.webgis_url && (
                      <a
                        href={m.webgis_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, color: "#a78bfa", textDecoration: "none" }}
                      >
                        🌐 WebGIS
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
