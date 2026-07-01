import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Card from "@/app/components/ui/Card";
import TalhaoMapClient from "./TalhaoMapClient";

export default async function TalhaoPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: talhao, error } = await supabase
    .from("talhoes")
    .select("*, fazendas(id, nome)")
    .eq("id", id)
    .single();

  if (error || !talhao) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", padding: 40 }}>
        Talhão não encontrado.
      </main>
    );
  }

  const { data: missoes } = await supabase
    .from("projetos")
    .select("id, codigo, status, data_voo, area_mapeada, alto_vigor, medio_vigor, baixo_vigor, fonte_captura, ortomosaico_img_url, ndvi_img_url, latitude, longitude")
    .eq("talhao_id", id)
    .order("data_voo", { ascending: false });

  const numMissoes = missoes?.length || 0;
  const nomeFazenda = (talhao as any).fazendas?.nome || "Fazenda Desconhecida";
  const fazendaId = (talhao as any).fazendas?.id ?? talhao.fazenda_id;

  // Monitoramentos para o mapa do talhão
  const monitoramentosMapa = (missoes || [])
    .filter((m) => m.latitude && m.longitude)
    .map((m) => ({
      id: m.id,
      codigo: m.codigo,
      data_voo: m.data_voo,
      status: m.status,
      ortomosaicoImgUrl: m.ortomosaico_img_url,
      ndviImgUrl: m.ndvi_img_url,
      lat: m.latitude,
      lng: m.longitude,
    }));

  return (
    <main className="praxis-content" style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* ── HEADER ──────────────────────────────────────── */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--bg-border)",
            borderRadius: "var(--radius-xl)",
            padding: "24px 28px",
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            {/* Breadcrumb */}
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}>
              <Link href="/dashboard/fazendas" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Fazendas</Link>
              <span>/</span>
              <Link href={`/dashboard/fazendas/${fazendaId}`} style={{ color: "var(--text-secondary)", textDecoration: "none" }}>{nomeFazenda}</Link>
              <span>/</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Talhão {talhao.nome}</span>
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
              🌱 {talhao.nome}
            </h1>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--text-secondary)" }}>
              {talhao.cultura && (
                <span>Cultura: <strong style={{ color: "var(--text-primary)" }}>{talhao.cultura}</strong></span>
              )}
              {talhao.variedade && (
                <span>Variedade: <strong style={{ color: "var(--text-primary)" }}>{talhao.variedade}</strong></span>
              )}
              {talhao.safra && (
                <span>Safra: <strong style={{ color: "var(--text-primary)" }}>{talhao.safra}</strong></span>
              )}
              {talhao.area && (
                <span>Área: <strong style={{ color: "#4ade80" }}>{talhao.area} ha</strong></span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href={`/dashboard/projetos/novo?talhaoId=${talhao.id}&fazendaId=${talhao.fazenda_id}`}
              style={{
                padding: "9px 18px",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 700,
                boxShadow: "0 4px 14px rgba(34,197,94,0.25)",
              }}
            >
              🚁 Novo Monitoramento
            </Link>
            <Link
              href={`/dashboard/fazendas/${fazendaId}`}
              style={{
                padding: "9px 14px",
                background: "var(--bg-hover)",
                border: "1px solid var(--bg-border)",
                color: "var(--text-secondary)",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontSize: 13,
              }}
            >
              ← Fazenda
            </Link>
            <Link
              href={`/dashboard/talhoes/${talhao.id}/excluir`}
              style={{
                padding: "9px 14px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "#ef4444",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              🗑️ Excluir
            </Link>
          </div>
        </div>

        {/* ── STATS ─────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Área Útil", value: `${talhao.area || 0} ha`, icon: "📐", cor: "#4ade80" },
            { label: "Cultura", value: talhao.cultura || "—", icon: "🌱", cor: "#86efac" },
            { label: "Safra", value: talhao.safra || "—", icon: "📅", cor: "#60a5fa" },
            { label: "Monitoramentos", value: String(numMissoes), icon: "🚁", cor: "#a78bfa" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--bg-border)",
                borderRadius: "var(--radius-lg)",
                padding: "18px 20px",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.cor, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── MAPA DO TALHÃO ───────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <TalhaoMapClient
            talhaoId={Number(id)}
            talhaoNome={talhao.nome}
            monitoramentos={monitoramentosMapa}
            altura="380px"
          />
        </div>

        {/* ── OBSERVAÇÕES ───────────────────────────────── */}
        {talhao.observacoes && (
          <Card className="mb-6">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>📝 Observações</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{talhao.observacoes}</p>
          </Card>
        )}

        {/* ── HISTÓRICO DE MONITORAMENTOS ────────────────── */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              🚁 Histórico de Monitoramentos
            </h2>
            {numMissoes > 0 && (
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {numMissoes} monitoramento{numMissoes !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {numMissoes > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {missoes?.map((missao) => (
                <div
                  key={missao.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 12,
                    padding: "14px 16px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--bg-border)",
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <Link
                        href={`/dashboard/projetos/${missao.id}`}
                        style={{ fontSize: 14, fontWeight: 700, color: "#a78bfa", textDecoration: "none" }}
                      >
                        {missao.codigo || `Monitoramento #${missao.id}`}
                      </Link>
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 7px",
                          borderRadius: 999,
                          fontWeight: 600,
                          background:
                            missao.status === "Concluído" ? "rgba(34,197,94,0.1)" :
                            missao.status === "Erro" ? "rgba(239,68,68,0.1)" :
                            "rgba(71,85,105,0.15)",
                          color:
                            missao.status === "Concluído" ? "#4ade80" :
                            missao.status === "Erro" ? "#f87171" :
                            "#94a3b8",
                        }}
                      >
                        {missao.status}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text-muted)" }}>
                      <span>📅 {missao.data_voo}</span>
                      {missao.area_mapeada > 0 && <span>📐 {missao.area_mapeada} ha</span>}
                      {missao.alto_vigor != null && (
                        <span>🟢 {missao.alto_vigor}% vigor</span>
                      )}
                      <span>{missao.fonte_captura === "Satelite" ? "🛰️" : "🚁"} {missao.fonte_captura || "Drone"}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <Link
                      href={`/dashboard/projetos/${missao.id}/mapa`}
                      style={{ padding: "6px 12px", background: "rgba(79,70,229,0.15)", color: "#818cf8", borderRadius: 8, textDecoration: "none", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}
                    >
                      🗺️ Mapa
                    </Link>
                    <Link
                      href={`/dashboard/projetos/${missao.id}`}
                      style={{ padding: "6px 12px", background: "rgba(34,197,94,0.1)", color: "#4ade80", borderRadius: 8, textDecoration: "none", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}
                    >
                      Ver →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🌾</div>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>
                Nenhum monitoramento registrado neste talhão.
              </p>
              <Link
                href={`/dashboard/projetos/novo?talhaoId=${talhao.id}&fazendaId=${talhao.fazenda_id}`}
                style={{
                  padding: "10px 20px",
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  color: "#4ade80",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  display: "inline-block",
                }}
              >
                Iniciar Primeiro Monitoramento →
              </Link>
            </div>
          )}
        </Card>

      </div>
    </main>
  );
}