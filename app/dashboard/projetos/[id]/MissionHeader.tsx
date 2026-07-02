import Badge from "@/app/components/ui/Badge";
import Link from "next/link";

interface MissionHeaderProps {
  projeto: {
    id: number;
    codigo: string;
    status: string;
    data_voo: string;
    area_mapeada: number;
    drone?: string | null;
    camera?: string | null;
    fazendas?: {
      id?: number;
      nome: string;
    } | null;
    talhoes?: {
      id?: number;
      nome: string;
      cultura?: string | null;
    } | null;
  };
}

export default function MissionHeader({ projeto }: MissionHeaderProps) {
  const statusColor =
    projeto.status === "Concluído" ? "green"
    : projeto.status === "Erro" ? "red"
    : projeto.status === "Processando" || projeto.status === "Fotos recebidas" ? "yellow"
    : "gray";

  const dataFormatada = projeto.data_voo
    ? new Date(projeto.data_voo + "T00:00:00").toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--bg-border)",
        borderRadius: "var(--radius-xl)",
        padding: "24px 28px",
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
          <Link href="/dashboard/fazendas" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
            Fazendas
          </Link>
          <span>/</span>
          {projeto.fazendas?.id ? (
            <Link href={`/dashboard/fazendas/${projeto.fazendas.id}`} style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
              {projeto.fazendas.nome}
            </Link>
          ) : (
            <span style={{ color: "var(--text-secondary)" }}>{projeto.fazendas?.nome ?? "—"}</span>
          )}
          <span>/</span>
          {projeto.talhoes?.id ? (
            <Link href={`/dashboard/talhoes/${projeto.talhoes.id}`} style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
              {projeto.talhoes.nome}
            </Link>
          ) : (
            <span style={{ color: "var(--text-secondary)" }}>{projeto.talhoes?.nome ?? "Talhão"}</span>
          )}
          <span>/</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Monitoramento</span>
        </div>

        {/* Header principal */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            {/* Título humanizado */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, margin: 0 }}>
                {projeto.fazendas?.nome ?? "Fazenda"}
              </h1>
              <Badge color={statusColor}>{projeto.status}</Badge>
            </div>

            {/* Subtítulo: talhão + cultura + data */}
            <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 12 }}>
              {projeto.talhoes?.nome && (
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                  {projeto.talhoes.nome}
                </span>
              )}
              {projeto.talhoes?.cultura && (
                <>
                  <span style={{ margin: "0 8px", color: "var(--text-muted)" }}>·</span>
                  <span>{projeto.talhoes.cultura}</span>
                </>
              )}
              <span style={{ margin: "0 8px", color: "var(--text-muted)" }}>·</span>
              <span>Monitoramento de {dataFormatada}</span>
            </div>

            {/* Metadados rápidos */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              {projeto.area_mapeada > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--text-muted)" }}>
                  <span>📐</span>
                  <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                    {projeto.area_mapeada} ha
                  </span>
                </div>
              )}
              {/* Código interno (discreto) */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-muted)" }}>
                <span style={{ fontFamily: "monospace", background: "var(--bg-surface)", padding: "4px 8px", borderRadius: 6 }}>
                  #{projeto.codigo}
                </span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
            {projeto.talhoes?.id && (
              <Link
                href={`/dashboard/talhoes/${projeto.talhoes.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--bg-border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
              >
                ⬅️ Voltar ao Talhão
              </Link>
            )}
            <Link
              href={`/dashboard/projetos/${projeto.id}/mapa`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: "var(--radius-md)",
                color: "#60a5fa",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              🗺️ WebGIS
            </Link>
            <Link
              href={`/dashboard/projetos/${projeto.id}/relatorio`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: "var(--radius-md)",
                color: "#4ade80",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              📄 Relatório
            </Link>
            <Link
              href={`/dashboard/projetos/${projeto.id}/editar`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "var(--bg-hover)",
                border: "1px solid var(--bg-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-secondary)",
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              ✏️ Editar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}