import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HistoricoChart from "./HistoricoChart";
import FarmTimeline from "./FarmTimeline";
import FarmMapClient from "./FarmMapClient";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";

export default async function FazendaPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: fazenda } = await supabase
    .from("fazendas")
    .select(`
      *,
      clientes!fazendas_cliente_id_fkey(nome),
      agronomos!fazendas_agronomo_id_fkey(nome),
      empresas_parceiras!fazendas_empresa_parceira_fkey(nome),
      talhoes(*)
    `)
    .eq("id", id)
    .single();

  const { data: projetos } = await supabase
    .from("projetos")
    .select("id, codigo, status, data_voo, area_mapeada, alto_vigor, medio_vigor, baixo_vigor, prioridade, talhao_id, latitude, longitude")
    .eq("fazenda_id", id)
    .order("data_voo", { ascending: false });

  const { data: intervencoes } = await supabase
    .from("intervencoes")
    .select("*")
    .eq("fazenda_id", id)
    .order("data_intervencao", { ascending: false });

  const { data: pragas } = await supabase
    .from("pragas")
    .select("*")
    .eq("fazenda_id", id)
    .order("data_identificacao", { ascending: false });

  if (!fazenda) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", padding: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Fazenda não encontrada</h1>
      </main>
    );
  }

  // ── Timeline ──────────────────────────────────────────────
  const eventosTimeline = [
    ...(projetos || []).map((p) => ({
      id: p.id,
      tipo: "monitoramento" as const,
      data: p.data_voo,
      titulo: `Monitoramento — ${p.area_mapeada ? `${p.area_mapeada} ha` : "—"}`,
      subtitulo: p.status,
      href: `/dashboard/projetos/${p.id}`,
      destaque:
        p.alto_vigor != null
          ? `Vigor: Alto (${p.alto_vigor}%) / Médio (${p.medio_vigor}%) / Baixo (${p.baixo_vigor}%)`
          : undefined,
    })),
    ...(intervencoes || []).map((i) => ({
      id: `i-${i.id}`,
      tipo: "intervencao" as const,
      data: i.data_intervencao,
      titulo: i.tipo_intervencao || "Intervenção",
      subtitulo: i.status || undefined,
      href: `/dashboard/intervencoes/${i.id}`,
    })),
    ...(pragas || []).map((p) => ({
      id: `p-${p.id}`,
      tipo: "praga" as const,
      data: p.data_identificacao,
      titulo: p.nome_cientifico || "Praga/Doença",
      subtitulo: p.risco ? `Risco: ${p.risco}` : undefined,
      href: `/dashboard/pragas/${p.id}`,
    })),
  ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  // ── Gráfico ───────────────────────────────────────────────
  const dadosGrafico = [...(projetos || [])]
    .filter((p) => p.alto_vigor || p.medio_vigor || p.baixo_vigor)
    .reverse()
    .map((p) => ({
      data: p.data_voo, alto: p.alto_vigor || 0, medio: p.medio_vigor || 0, baixo: p.baixo_vigor || 0,
    }));

  const projetosValidos = (projetos || []).filter((p) => p.prioridade);
  const ultimoProjeto = projetosValidos[0];
  const projetoAnterior = projetosValidos[1];

  let comparacao = null;
  let situacao = null;
  let corSituacao = "";

  if (ultimoProjeto && projetoAnterior) {
    comparacao = {
      alto: (ultimoProjeto.alto_vigor || 0) - (projetoAnterior.alto_vigor || 0),
      medio: (ultimoProjeto.medio_vigor || 0) - (projetoAnterior.medio_vigor || 0),
      baixo: (ultimoProjeto.baixo_vigor || 0) - (projetoAnterior.baixo_vigor || 0),
    };
    const score = comparacao.alto - comparacao.baixo;
    if (score >= 5) {
      situacao = "Melhora significativa observada em relação ao monitoramento anterior.";
      corSituacao = "#4ade80";
    } else if (score <= -5) {
      situacao = "Redução do vigor vegetativo observada. Recomenda-se investigação das causas.";
      corSituacao = "#f87171";
    } else {
      situacao = "Área estável em relação ao último monitoramento.";
      corSituacao = "#fbbf24";
    }
  }

  // ── Talhões para o mapa ───────────────────────────────────
  const talhoesMapa = (fazenda.talhoes || []).map((t: any) => {
    // Busca um projeto associado a este talhão que possua coordenadas
    const proj = projetos?.find((p) => p.talhao_id === t.id && p.latitude && p.longitude);
    return {
      id: t.id,
      nome: t.nome,
      cultura: t.cultura,
      area: t.area,
      lat: proj?.latitude || null,
      lng: proj?.longitude || null,
    };
  });

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
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
              <Link href="/dashboard/fazendas" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
                Fazendas
              </Link>
              <span style={{ margin: "0 6px" }}>/</span>
              <span style={{ color: "var(--text-primary)" }}>{fazenda.nome}</span>
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
              {fazenda.nome}
            </h1>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Localização</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>
                  {fazenda.cidade}{fazenda.estado ? `, ${fazenda.estado}` : ""}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Área Total</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>{fazenda.area_ha} ha</div>
              </div>
              {(fazenda as any).clientes?.nome && (
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Cliente</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>{(fazenda as any).clientes.nome}</div>
                </div>
              )}
              {(fazenda as any).agronomos?.nome && (
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Agrônomo</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>{(fazenda as any).agronomos.nome}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Talhões</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>{(fazenda.talhoes || []).length}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Monitoramentos</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#4ade80" }}>{(projetos || []).length}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link
              href={`/dashboard/fazendas/${fazenda.id}/evolucao`}
              style={{
                padding: "9px 18px",
                background: "linear-gradient(135deg, #22c55e, #4f46e5)",
                color: "#fff",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 16px rgba(34,197,94,0.2)",
              }}
            >
              📈 Inteligência Temporal
            </Link>
            <Link
              href={`/dashboard/projetos/novo?fazenda_id=${fazenda.id}`}
              style={{
                padding: "9px 16px",
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.2)",
                color: "#4ade80",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              + Novo Monitoramento
            </Link>
            <Link
              href={`/dashboard/fazendas/${fazenda.id}/editar`}
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
              ✏️ Editar
            </Link>
            <Link
              href={`/dashboard/fazendas/${fazenda.id}/excluir`}
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Área Total", value: `${fazenda.area_ha} ha`, icon: "📐", cor: "#4ade80" },
            { label: "Próximo Voo", value: fazenda.proximo_voo ? new Date(fazenda.proximo_voo + "T00:00:00").toLocaleDateString("pt-BR") : "—", icon: "🗓️", cor: "#60a5fa" },
            { label: "Monitoramentos", value: String(projetos?.length || 0), icon: "🚁", cor: "#a78bfa" },
            { label: "Intervenções", value: String(intervencoes?.length || 0), icon: "🧪", cor: "#38bdf8" },
            { label: "Talhões", value: String((fazenda.talhoes || []).length), icon: "🌾", cor: "#fb923c" },
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
              <div style={{ fontSize: 22, fontWeight: 800, color: s.cor, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── LAYOUT PRINCIPAL: Mapa + Timeline ─────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, marginBottom: 24, alignItems: "start" }}>
          {/* FarmMap */}
          <div>
            <FarmMapClient
              fazendaId={fazenda.id}
              fazendaNome={fazenda.nome}
              talhoes={talhoesMapa}
              altura="420px"
            />
          </div>

          {/* Timeline */}
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            <FarmTimeline eventos={eventosTimeline} fazendaNome={fazenda.nome} />
          </div>
        </div>

        {/* ── TALHÕES ───────────────────────────────────── */}
        <Card className="mb-6">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>🌱 Talhões</h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                Selecione uma área para ver monitoramentos ou agendar novos voos.
              </p>
            </div>
            <Link
              href={`/dashboard/talhoes/novo?fazenda_id=${fazenda.id}`}
              style={{
                padding: "8px 16px",
                background: "var(--praxis-green-600)",
                color: "#fff",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              + Novo Talhão
            </Link>
          </div>

          {fazenda.talhoes && fazenda.talhoes.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {(fazenda.talhoes as any[]).map((talhao) => (
                <Link
                  key={talhao.id}
                  href={`/dashboard/talhoes/${talhao.id}`}
                  style={{
                    display: "block",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--bg-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "16px",
                    textDecoration: "none",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{talhao.nome}</h3>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--bg-hover)", padding: "2px 6px", borderRadius: 4 }}>
                      {talhao.area || 0} ha
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {talhao.cultura || "Cultura não informada"}
                  </p>
                  <div style={{ marginTop: 10, fontSize: 11, color: "#4ade80", fontWeight: 600 }}>
                    Acessar Talhão →
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "24px 0", fontSize: 13 }}>
              Nenhum talhão cadastrado. Crie o primeiro talhão para começar.
            </p>
          )}
        </Card>

        {/* ── IA + COMPARAÇÃO ───────────────────────────── */}
        {(situacao || comparacao) && (
          <div style={{ display: "grid", gridTemplateColumns: situacao && comparacao ? "1fr 1fr" : "1fr", gap: 16, marginBottom: 24 }}>
            {situacao && (
              <Card>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>🧠 Análise IA</h2>
                <p style={{ fontSize: 14, fontWeight: 600, color: corSituacao }}>{situacao}</p>
              </Card>
            )}
            {comparacao && (
              <Card>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>📈 Comparação de Vigor</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, textAlign: "center" }}>
                  {[
                    { label: "Alto", value: comparacao.alto, cor: comparacao.alto >= 0 ? "#4ade80" : "#f87171" },
                    { label: "Médio", value: comparacao.medio, cor: comparacao.medio >= 0 ? "#4ade80" : "#f87171" },
                    { label: "Baixo", value: comparacao.baixo, cor: comparacao.baixo <= 0 ? "#4ade80" : "#f87171" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: item.cor }}>
                        {item.value > 0 ? "+" : ""}{item.value}%
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ── GRÁFICO HISTÓRICO ─────────────────────────── */}
        {dadosGrafico.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <HistoricoChart data={dadosGrafico} />
          </div>
        )}

        {/* ── INTERVENÇÕES + PRAGAS ─────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          {/* Intervenções */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>🧪 Intervenções</h2>
              <Link
                href={`/dashboard/intervencoes/novo?fazenda_id=${fazenda.id}`}
                style={{ fontSize: 12, color: "#4ade80", textDecoration: "none", fontWeight: 600 }}
              >
                + Adicionar
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {intervencoes?.length ? (
                intervencoes.slice(0, 5).map((item) => (
                  <Link
                    key={item.id}
                    href={`/dashboard/intervencoes/${item.id}`}
                    style={{
                      display: "block",
                      padding: "10px 12px",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--bg-border)",
                      borderRadius: 8,
                      textDecoration: "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{item.tipo || "Tratamento"}</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.data_intervencao}</span>
                    </div>
                    {item.produto && (
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Produto: {item.produto}</span>
                    )}
                  </Link>
                ))
              ) : (
                <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
                  Nenhuma intervenção registrada.
                </p>
              )}
            </div>
          </Card>

          {/* Pragas */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>🐛 Pragas & Doenças</h2>
              <Link
                href={`/dashboard/pragas/novo?fazenda_id=${fazenda.id}`}
                style={{ fontSize: 12, color: "#fbbf24", textDecoration: "none", fontWeight: 600 }}
              >
                + Relatar
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pragas?.length ? (
                pragas.slice(0, 5).map((praga) => (
                  <div
                    key={praga.id}
                    style={{
                      padding: "10px 12px",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--bg-border)",
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{praga.nome}</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{praga.data_identificacao}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Badge color={praga.nivel_infestacao === "Alto" ? "red" : praga.nivel_infestacao === "Médio" ? "yellow" : "green"}>
                        {praga.nivel_infestacao}
                      </Badge>
                      <Badge color={praga.status === "Resolvido" ? "green" : "yellow"}>{praga.status}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
                  Nenhuma praga ou doença relatada.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* ── HISTÓRICO DE MONITORAMENTOS ────────────────── */}
        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            🚁 Histórico de Monitoramentos
          </h2>
          {projetos?.length ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--bg-border)", color: "var(--text-muted)" }}>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600 }}>Monitoramento</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600 }}>Data Voo</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#4ade80" }}>Alto Vigor</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#fbbf24" }}>Médio Vigor</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#f87171" }}>Baixo Vigor</th>
                    <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {projetos.map((projeto) => (
                    <tr
                      key={projeto.id}
                      style={{ borderBottom: "1px solid var(--bg-surface)", transition: "background 0.15s" }}
                    >
                      <td style={{ padding: "10px 12px" }}>
                        <Link
                          href={`/dashboard/projetos/${projeto.id}`}
                          style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 600 }}
                        >
                          {projeto.codigo}
                        </Link>
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{projeto.data_voo}</td>
                      <td style={{ padding: "10px 12px", color: "#4ade80", fontWeight: 600 }}>{projeto.alto_vigor || 0}%</td>
                      <td style={{ padding: "10px 12px", color: "#fbbf24", fontWeight: 600 }}>{projeto.medio_vigor || 0}%</td>
                      <td style={{ padding: "10px 12px", color: "#f87171", fontWeight: 600 }}>{projeto.baixo_vigor || 0}%</td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <Link
                            href={`/dashboard/projetos/${projeto.id}/mapa`}
                            style={{ padding: "4px 10px", background: "rgba(79,70,229,0.15)", color: "#818cf8", borderRadius: 6, textDecoration: "none", fontSize: 11, fontWeight: 600 }}
                          >
                            🗺️ Mapa
                          </Link>
                          <Link
                            href={`/dashboard/projetos/${projeto.id}`}
                            style={{ padding: "4px 10px", background: "rgba(34,197,94,0.1)", color: "#4ade80", borderRadius: 6, textDecoration: "none", fontSize: 11, fontWeight: 600 }}
                          >
                            Ver →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "24px 0", fontSize: 13 }}>
              Nenhum monitoramento encontrado.{" "}
              <Link href={`/dashboard/projetos/novo?fazenda_id=${fazenda.id}`} style={{ color: "#4ade80", textDecoration: "none" }}>
                Criar o primeiro →
              </Link>
            </p>
          )}
        </Card>

      </div>
    </main>
  );
}