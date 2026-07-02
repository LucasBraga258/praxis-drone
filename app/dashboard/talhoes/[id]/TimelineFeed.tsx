"use client";

import React, { useState } from "react";
import Link from "next/link";

type TimelineEvent = {
  id: string;
  tipo: "monitoramento" | "intervencao" | "praga" | "clima";
  data: string;
  titulo: string;
  subtitulo?: string;
  href?: string;
  destaque?: string;
  cor: string;
  icone: string;
};

export default function TimelineFeed({ eventos, talhaoId }: { eventos: TimelineEvent[], talhaoId: number }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--bg-border)",
      borderRadius: "var(--radius-xl)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      maxHeight: "800px"
    }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--bg-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>⏳ Linha do Tempo</h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>O Gêmeo Digital do Talhão</p>
        </div>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              padding: "8px 14px",
              background: "var(--praxis-green-600)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            + Adicionar Evento
          </button>
          
          {showMenu && (
            <div style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: 8,
              background: "var(--bg-surface)",
              border: "1px solid var(--bg-border)",
              borderRadius: "var(--radius-md)",
              width: 220,
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              zIndex: 50,
              overflow: "hidden"
            }}>
              <Link href={`/dashboard/intervencoes/novo?talhao_id=${talhaoId}`} style={{ display: "block", padding: "12px 16px", textDecoration: "none", color: "var(--text-primary)", fontSize: 13, borderBottom: "1px solid var(--bg-border)" }}>
                🧪 Registrar Intervenção
              </Link>
              <Link href={`/dashboard/pragas/novo?talhao_id=${talhaoId}`} style={{ display: "block", padding: "12px 16px", textDecoration: "none", color: "var(--text-primary)", fontSize: 13, borderBottom: "1px solid var(--bg-border)" }}>
                🐛 Registrar Praga/Doença
              </Link>
              {/* Note: Rain input is already a button on the header, but could be here too */}
              <button onClick={() => { setShowMenu(false); document.getElementById('rain-input-btn')?.click(); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", background: "none", border: "none", color: "var(--text-primary)", fontSize: 13, cursor: "pointer" }}>
                🌧️ Registrar Chuva
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
        {eventos.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", marginTop: 40 }}>
            Nenhum evento registrado na linha do tempo.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {eventos.map((evento, idx) => (
              <div key={evento.id} style={{ display: "flex", gap: 16, position: "relative" }}>
                {idx !== eventos.length - 1 && (
                  <div style={{ position: "absolute", left: 19, top: 40, bottom: -16, width: 2, background: "var(--bg-border)" }} />
                )}
                
                <div style={{
                  width: 40, height: 40, borderRadius: 20, background: evento.cor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, zIndex: 2
                }}>
                  {evento.icone}
                </div>
                
                <div style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--bg-border)",
                  borderRadius: 12,
                  padding: 16,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{evento.titulo}</h3>
                      {evento.subtitulo && (
                        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{evento.subtitulo}</p>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--bg-base)", padding: "4px 8px", borderRadius: 12 }}>
                      {evento.data}
                    </span>
                  </div>
                  
                  {evento.destaque && (
                    <div style={{ fontSize: 12, color: evento.cor, fontWeight: 600, background: "var(--bg-base)", padding: "8px 12px", borderRadius: 8 }}>
                      {evento.destaque}
                    </div>
                  )}

                  {evento.href && (
                    <div style={{ alignSelf: "flex-end", marginTop: 4 }}>
                      <Link href={evento.href} style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textDecoration: "none" }}>
                        Detalhes →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
