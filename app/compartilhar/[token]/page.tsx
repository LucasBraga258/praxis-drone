"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface Compartilhamento {
  id: string;
  projeto_id: number;
  titulo: string;
  criado_por: string;
  expira_em: string;
  visualizacoes: number;
}

interface Missao {
  id: number;
  codigo: string;
  status: string;
  data_voo: string;
  area_mapeada: number;
  alto_vigor: number;
  medio_vigor: number;
  baixo_vigor: number;
  pdf_url: string;
  ndvi_url: string;
  ortomosaico_url: string;
  ndvi_img_url: string;
  ortomosaico_img_url: string;
  fazendas: { nome: string; cidade: string; estado: string; cultura: string } | null;
}

function LockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function DroneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10V6" /><path d="M12 18v-6" />
      <path d="M10 12H6" /><path d="M18 12h-6" />
      <path d="M5.05 5.05l1.41 1.41" /><path d="M17.54 6.46l1.41-1.41" />
      <path d="M5.05 18.95l1.41-1.41" /><path d="M17.54 17.54l1.41 1.41" />
    </svg>
  );
}

export default function CompartilharPage() {
  const { token } = useParams<{ token: string }>();
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [acesso, setAcesso] = useState(false);
  const [compartilhamento, setCompartilhamento] = useState<Compartilhamento | null>(null);
  const [missao, setMissao] = useState<Missao | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Verificar se o token existe e não expirou
    supabase
      .from("compartilhamentos")
      .select("*")
      .eq("token", token)
      .eq("ativo", true)
      .gt("expira_em", new Date().toISOString())
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setCompartilhamento(data);
        }
      });
  }, [token]);

  function handlePinInput(index: number, valor: string) {
    if (!/^\d?$/.test(valor)) return;
    const novo = [...pin];
    novo[index] = valor;
    setPin(novo);
    if (valor && index < 5) {
      const next = document.getElementById(`pin-${index + 1}`);
      next?.focus();
    }
  }

  function handlePinKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      const prev = document.getElementById(`pin-${index - 1}`);
      prev?.focus();
    }
  }

  async function verificarPin() {
    const pinDigitado = pin.join("");
    if (pinDigitado.length !== 6) {
      setErro("Digite os 6 dígitos do PIN.");
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const { data } = await supabase
        .from("compartilhamentos")
        .select("*")
        .eq("token", token)
        .eq("pin", pinDigitado)
        .eq("ativo", true)
        .gt("expira_em", new Date().toISOString())
        .single();

      if (!data) {
        setErro("PIN incorreto. Verifique e tente novamente.");
        setPin(["", "", "", "", "", ""]);
        document.getElementById("pin-0")?.focus();
        return;
      }

      // Registrar visualização
      await supabase
        .from("compartilhamentos")
        .update({ visualizacoes: (data.visualizacoes || 0) + 1 })
        .eq("id", data.id);

      // Buscar dados da missão
      const { data: proj } = await supabase
        .from("projetos")
        .select("*, fazendas(nome, cidade, estado, cultura)")
        .eq("id", data.projeto_id)
        .single();

      setMissao(proj);
      setAcesso(true);
    } catch {
      setErro("Erro ao verificar o PIN.");
    } finally {
      setCarregando(false);
    }
  }

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Link Inválido ou Expirado</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Este link de compartilhamento não existe ou já expirou. Solicite um novo link ao seu agrônomo.</p>
        </div>
      </div>
    );
  }

  if (!compartilhamento) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "3px solid rgba(34,197,94,0.3)", borderTop: "3px solid #22c55e", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Tela de acesso com PIN
  if (!acesso) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            background: "var(--bg-card)",
            border: "1px solid var(--bg-border)",
            borderRadius: "var(--radius-2xl)",
            padding: 40,
            textAlign: "center",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #22c55e, #16a34a)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(34,197,94,0.3)" }}>
              <DroneIcon />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>Praxis</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Compartilhamento Seguro</div>
            </div>
          </div>

          <div style={{ width: 56, height: 56, background: "rgba(34,197,94,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#4ade80" }}>
            <LockIcon />
          </div>

          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            {compartilhamento.titulo || "Missão Compartilhada"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
            Compartilhado por <strong style={{ color: "var(--text-secondary)" }}>{compartilhamento.criado_por}</strong>
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 32 }}>
            Válido até {new Date(compartilhamento.expira_em).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 16 }}>
            Digite o PIN de 6 dígitos para acessar
          </p>

          {/* PIN Input */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
            {pin.map((d, i) => (
              <input
                key={i}
                id={`pin-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handlePinInput(i, e.target.value)}
                onKeyDown={(e) => handlePinKeyDown(i, e)}
                style={{
                  width: 46,
                  height: 56,
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  background: "var(--bg-surface)",
                  border: `2px solid ${erro ? "rgba(239,68,68,0.5)" : d ? "rgba(34,197,94,0.5)" : "var(--bg-border)"}`,
                  borderRadius: 10,
                  color: "var(--text-primary)",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {erro && (
            <p style={{ fontSize: 12.5, color: "#f87171", marginBottom: 16, background: "rgba(239,68,68,0.08)", padding: "8px 16px", borderRadius: 8 }}>
              {erro}
            </p>
          )}

          <button
            onClick={verificarPin}
            disabled={carregando || pin.join("").length !== 6}
            style={{
              width: "100%",
              padding: "13px",
              background: pin.join("").length === 6 && !carregando
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : "var(--bg-hover)",
              border: "none",
              borderRadius: "var(--radius-md)",
              color: pin.join("").length === 6 ? "#fff" : "var(--text-muted)",
              fontSize: 14,
              fontWeight: 600,
              cursor: pin.join("").length === 6 && !carregando ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              boxShadow: pin.join("").length === 6 ? "0 2px 12px rgba(34,197,94,0.3)" : "none",
            }}
          >
            {carregando ? "Verificando..." : "Acessar Missão"}
          </button>
        </div>
      </div>
    );
  }

  // Conteúdo da missão (após PIN correto)
  if (!missao) return null;

  const fazenda = Array.isArray(missao.fazendas) ? missao.fazendas[0] : missao.fazendas;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Header */}
      <header style={{ height: 60, background: "rgba(6,15,27,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--bg-border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, background: "linear-gradient(135deg, #22c55e, #16a34a)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DroneIcon />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Praxis</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Relatório de Missão</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          🔒 Acesso verificado por PIN
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

        {/* Hero */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-2xl)", padding: "32px 40px", marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: "#4ade80", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Relatório de Missão · {compartilhamento.titulo}
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            {missao.codigo}
          </h1>
          {fazenda && (
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              {fazenda.nome} {fazenda.cidade ? `📍 ${fazenda.cidade}/${fazenda.estado}` : ""} {fazenda.cultura ? `🌱 ${fazenda.cultura}` : ""}
            </p>
          )}
          <div style={{ display: "flex", gap: 20, marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--bg-border)", flexWrap: "wrap" }}>
            {[
              { label: "Data do Voo", value: missao.data_voo ? new Date(missao.data_voo).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }) : "—" },
              { label: "Área Mapeada", value: missao.area_mapeada ? `${missao.area_mapeada} ha` : "—" },
              { label: "Status", value: missao.status },
            ].map((s) => (
              <div key={s.label}>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Vigor Vegetativo */}
        {(missao.alto_vigor || missao.medio_vigor || missao.baixo_vigor) && (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
              Vigor Vegetativo
            </h2>
            <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", height: 12, marginBottom: 16 }}>
              <div style={{ flex: missao.alto_vigor || 0, background: "#22c55e" }} />
              <div style={{ flex: missao.medio_vigor || 0, background: "#f59e0b" }} />
              <div style={{ flex: missao.baixo_vigor || 0, background: "#ef4444" }} />
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              {[
                { label: "Alto Vigor", value: `${missao.alto_vigor || 0}%`, cor: "#4ade80", bg: "rgba(34,197,94,0.1)" },
                { label: "Médio Vigor", value: `${missao.medio_vigor || 0}%`, cor: "#fbbf24", bg: "rgba(245,158,11,0.1)" },
                { label: "Baixo Vigor", value: `${missao.baixo_vigor || 0}%`, cor: "#f87171", bg: "rgba(239,68,68,0.1)" },
              ].map((v) => (
                <div key={v.label} style={{ textAlign: "center", background: v.bg, padding: "12px 20px", borderRadius: "var(--radius-md)", flex: 1 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: v.cor }}>{v.value}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{v.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Downloads */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            Produtos e Downloads
          </h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {missao.pdf_url && (
              <a href={missao.pdf_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", borderRadius: "var(--radius-md)", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
                📥 Relatório PDF
              </a>
            )}
            {missao.ndvi_url && (
              <a href={missao.ndvi_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)", borderRadius: "var(--radius-md)", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
                🗺 Mapa NDVI
              </a>
            )}
            {missao.ortomosaico_url && (
              <a href={missao.ortomosaico_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "var(--radius-md)", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
                🌍 Ortomosaico
              </a>
            )}
          </div>
          {!missao.pdf_url && !missao.ndvi_url && !missao.ortomosaico_url && (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Nenhum produto disponível para download ainda.</p>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--bg-border)" }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Relatório gerado pela plataforma <strong style={{ color: "#4ade80" }}>Praxis Agricultura de Precisão</strong>
          </p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            Compartilhado por {compartilhamento.criado_por} · Visualizações: {compartilhamento.visualizacoes}
          </p>
        </div>
      </div>
    </div>
  );
}
