"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Mensagem {
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

interface Fazenda {
  id: number;
  nome: string;
}

const SUGESTOES = [
  "Como está a saúde das minhas fazendas?",
  "Quais fazendas têm monitoramentos vencidos?",
  "Resuma as últimas missões realizadas.",
  "Há pragas ativas que precisam de atenção?",
  "Qual a área total monitorada na plataforma?",
  "Compare o vigor vegetativo das últimas missões.",
];

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function BotAvatar() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 2px 8px rgba(34,197,94,0.3)",
      }}
    >
      <SparkleIcon />
    </div>
  );
}

function UserAvatar() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: 13,
        fontWeight: 700,
        color: "#fff",
      }}
    >
      L
    </div>
  );
}

function MensagemBubble({ msg }: { msg: Mensagem }) {
  const isUser = msg.role === "user";

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        marginBottom: 20,
      }}
    >
      {isUser ? <UserAvatar /> : <BotAvatar />}

      <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", gap: 4, alignItems: isUser ? "flex-end" : "flex-start" }}>
        <div
          style={{
            padding: "12px 16px",
            borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
            background: isUser ? "linear-gradient(135deg, #22c55e, #16a34a)" : "var(--bg-card)",
            border: isUser ? "none" : "1px solid var(--bg-border)",
            color: isUser ? "#fff" : "var(--text-primary)",
            fontSize: 13.5,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
          dangerouslySetInnerHTML={{
            __html: msg.content
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/^- /gm, "• ")
              .replace(/\n/g, "<br/>"),
          }}
        />
        <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
          {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 }}>
      <BotAvatar />
      <div
        style={{
          padding: "14px 18px",
          background: "var(--bg-card)",
          border: "1px solid var(--bg-border)",
          borderRadius: "4px 16px 16px 16px",
          display: "flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#4ade80",
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function IAPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      role: "model",
      content: "Olá! Sou o **Assistente Agronômico Praxis**. Tenho acesso a todas as informações da sua plataforma — fazendas, talhões, missões, intervenções e muito mais.\n\nComo posso te ajudar hoje?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [fazendaSelecionada, setFazendaSelecionada] = useState<number | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    supabase.from("fazendas").select("id, nome").order("nome").then(({ data }) => {
      setFazendas(data ?? []);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, carregando]);

  async function enviar(texto?: string) {
    const pergunta = texto || input.trim();
    if (!pergunta || carregando) return;

    const novaMensagem: Mensagem = { role: "user", content: pergunta, timestamp: new Date() };
    setMensagens((prev) => [...prev, novaMensagem]);
    setInput("");
    setCarregando(true);

    try {
      const historico = mensagens.map((m) => ({ role: m.role, parts: m.content }));

      const res = await fetch("/api/ia-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pergunta,
          historico,
          fazendaId: fazendaSelecionada,
        }),
      });

      const data = await res.json();

      setMensagens((prev) => [
        ...prev,
        {
          role: "model",
          content: data.resposta || "Não consegui gerar uma resposta.",
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMensagens((prev) => [
        ...prev,
        {
          role: "model",
          content: "Ocorreu um erro ao processar sua pergunta. Verifique a conexão e tente novamente.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setCarregando(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  return (
    <div className="praxis-content" style={{ padding: 0, display: "flex", height: "calc(100vh - 72px)" }}>

      {/* Sidebar IA */}
      <div
        style={{
          width: 280,
          borderRight: "1px solid var(--bg-border)",
          background: "var(--bg-surface)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "24px 20px 16px" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            IA Assistente
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Faça perguntas em linguagem natural sobre suas fazendas e missões.
          </p>
        </div>

        {/* Contexto: Fazenda */}
        <div style={{ padding: "0 16px 16px" }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 8 }}>
            Contexto
          </p>
          <select
            value={fazendaSelecionada || ""}
            onChange={(e) => setFazendaSelecionada(e.target.value ? Number(e.target.value) : undefined)}
            className="praxis-input"
            style={{ fontSize: 12.5, padding: "8px 12px" }}
          >
            <option value="">Todas as fazendas</option>
            {fazendas.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
        </div>

        {/* Sugestões */}
        <div style={{ padding: "0 16px", flex: 1, overflowY: "auto" }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>
            Sugestões
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {SUGESTOES.map((s) => (
              <button
                key={s}
                onClick={() => enviar(s)}
                disabled={carregando}
                style={{
                  padding: "8px 12px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--bg-border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-secondary)",
                  fontSize: 12,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  lineHeight: 1.4,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Clear */}
        <div style={{ padding: 16, borderTop: "1px solid var(--bg-border)" }}>
          <button
            onClick={() => setMensagens([{ role: "model", content: "Conversa reiniciada. Como posso te ajudar?", timestamp: new Date() }])}
            style={{
              width: "100%",
              padding: "8px",
              background: "transparent",
              border: "1px solid var(--bg-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-muted)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Limpar conversa
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          {mensagens.map((m, i) => (
            <MensagemBubble key={i} msg={m} />
          ))}
          {carregando && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          style={{
            borderTop: "1px solid var(--bg-border)",
            padding: "16px 24px",
            background: "var(--bg-surface)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-end",
              background: "var(--bg-card)",
              border: "1px solid var(--bg-border)",
              borderRadius: "var(--radius-xl)",
              padding: "8px 8px 8px 16px",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Pergunte sobre fazendas, missões, pragas, intervenções..."
              disabled={carregando}
              rows={1}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                color: "var(--text-primary)",
                fontSize: 13.5,
                outline: "none",
                resize: "none",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.6,
                maxHeight: 120,
                paddingTop: 4,
              }}
            />
            <button
              onClick={() => enviar()}
              disabled={carregando || !input.trim()}
              style={{
                width: 38,
                height: 38,
                borderRadius: "var(--radius-md)",
                background: input.trim() && !carregando
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : "var(--bg-hover)",
                border: "none",
                color: "#fff",
                cursor: input.trim() && !carregando ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.15s",
              }}
            >
              <SendIcon />
            </button>
          </div>
          <p style={{ fontSize: 10.5, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>
            A IA apresenta informações. Todas as decisões são do agrônomo responsável.
          </p>
        </div>
      </div>
    </div>
  );
}
