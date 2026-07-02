import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Card from "@/app/components/ui/Card";
import TalhaoMapClient from "./TalhaoMapClient";
import RainInputButton from "./RainInputButton";
import IASummaryCard from "./IASummaryCard";
import SplitMapClient from "./SplitMapClient";
import TimelineFeed from "./TimelineFeed";
import SyncSatelliteButton from "./SyncSatelliteButton";

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
    .select("id, codigo, status, data_voo, area_mapeada, alto_vigor, medio_vigor, baixo_vigor, fonte_captura, ortomosaico_img_url, ndvi_img_url, vari_img_url, falsa_cor_img_url, dsm_img_url, dtm_img_url, latitude, longitude")
    .eq("talhao_id", id)
    .order("data_voo", { ascending: false });

  const numMissoes = missoes?.length || 0;
  const nomeFazenda = (talhao as any).fazendas?.nome || "Fazenda Desconhecida";
  const fazendaId = (talhao as any).fazendas?.id ?? talhao.fazenda_id;

  const { data: intervencoes } = await supabase
    .from("intervencoes")
    .select("*")
    .eq("talhao_id", id)
    .order("data_realizacao", { ascending: false });

  const { data: pragas } = await supabase
    .from("pragas")
    .select("*")
    .eq("fazenda_id", fazendaId)
    .order("created_at", { ascending: false }); // fallback se der erro será apenas ignorar o data nulo

  const { data: chuvas } = await supabase
    .from("dados_iot")
    .select("*")
    .eq("talhao_id", id)
    .eq("tipo_sensor", "PLUVIOMETRO_MANUAL")
    .order("data_leitura", { ascending: false });

  // ── Montando a Linha do Tempo ─────────────────────────────
  const eventosTimeline = [
    ...(missoes || []).map((m) => ({
      id: `m-${m.id}`,
      tipo: "monitoramento" as const,
      data: m.data_voo,
      titulo: m.fonte_captura === "Satelite" ? "🛰️ Passagem Satélite" : "🚁 Voo de Drone",
      subtitulo: m.codigo,
      href: `/dashboard/projetos/${m.id}`,
      destaque: m.alto_vigor != null ? `Vigor: Alto (${m.alto_vigor}%) | Baixo (${m.baixo_vigor}%)` : undefined,
      cor: m.fonte_captura === "Satelite" ? "#3b82f6" : "#8b5cf6",
      icone: m.fonte_captura === "Satelite" ? "🛰️" : "🚁"
    })),
    ...(intervencoes || []).map((i) => ({
      id: `i-${i.id}`,
      tipo: "intervencao" as const,
      data: i.data_realizacao || i.created_at?.split("T")[0] || "",
      titulo: i.tipo || "Intervenção",
      subtitulo: i.status,
      href: `/dashboard/intervencoes/${i.id}`,
      cor: "#10b981",
      icone: "🧪"
    })),
    ...(pragas || []).map((p) => ({
      id: `p-${p.id}`,
      tipo: "praga" as const,
      data: p.created_at?.split("T")[0] || "",
      titulo: p.nome || "Praga/Doença",
      subtitulo: p.gravidade ? `Gravidade: ${p.gravidade}` : undefined,
      cor: "#f59e0b",
      icone: "🐛"
    })),
    ...(chuvas || []).map((c) => ({
      id: `c-${c.id}`,
      tipo: "clima" as const,
      data: c.data_leitura?.split("T")[0] || "",
      titulo: "Chuva Registrada",
      subtitulo: `${c.valor} ${c.unidade}`,
      cor: "#0ea5e9",
      icone: "🌧️"
    }))
  ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

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
      variImgUrl: m.vari_img_url,
      falsaCorImgUrl: m.falsa_cor_img_url,
      dsmImgUrl: m.dsm_img_url,
      dtmImgUrl: m.dtm_img_url,
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
              {talhao.area_hectares && (
                <span>Área: <strong style={{ color: "#4ade80" }}>{talhao.area_hectares} ha</strong></span>
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
            <SyncSatelliteButton talhaoId={Number(id)} />
            <RainInputButton talhaoId={Number(id)} />
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
            <Link href={`/dashboard/talhoes/${talhao.id}/editar`} style={{ padding: "8px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", color: "var(--text-primary)", borderRadius: "var(--radius-md)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>✏️ Editar</Link>
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
            { label: "Área Útil", value: `${talhao.area_hectares || talhao.area || 0} ha`, icon: "📐", cor: "#4ade80" },
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

        {/* ── LAYOUT HÍBRIDO (Mapa + Timeline) ───────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, marginBottom: 24, alignItems: "start" }}>
          
          {/* Esquerda: IA e Mapa */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <IASummaryCard talhaoId={Number(id)} />
            
            <div>
              {monitoramentosMapa.length >= 2 ? (
                <SplitMapClient
                  bbox={talhao.bbox_geojson ? {
                    lat_centro: talhao.latitude || 0,
                    lng_centro: talhao.longitude || 0,
                    coordinates: talhao.bbox_geojson.coordinates
                  } : null}
                  esquerda={monitoramentosMapa[1]}
                  direita={monitoramentosMapa[0]}
                />
              ) : (
                <TalhaoMapClient
                  talhaoId={Number(id)}
                  talhaoNome={talhao.nome}
                  monitoramentos={monitoramentosMapa}
                  altura="450px"
                  talhaoGeojson={talhao.bbox_geojson || talhao.limites_geojson}
                  talhaoLat={talhao.latitude}
                  talhaoLng={talhao.longitude}
                />
              )}
            </div>
          </div>

          {/* Direita: Timeline */}
          <div>
            <TimelineFeed eventos={eventosTimeline} talhaoId={Number(id)} />
          </div>

        </div>

        {/* ── OBSERVAÇÕES ───────────────────────────────── */}
        {talhao.observacoes && (
          <Card className="mb-6">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>📝 Observações</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{talhao.observacoes}</p>
          </Card>
        )}

        {/* ── HISTÓRICO DE MONITORAMENTOS (Substituído pela Timeline) ────────────────── */}
      </div>
    </main>
  );
}