"use client";

import { useState } from "react";
import { toast } from "sonner";

interface RainInputModalProps {
  talhaoId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RainInputModal({ talhaoId, isOpen, onClose, onSuccess }: RainInputModalProps) {
  const [valor, setValor] = useState("");
  const [dataLeitura, setDataLeitura] = useState(new Date().toISOString().split("T")[0]);
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valor || isNaN(Number(valor))) {
      toast.error("Insira um valor válido em mm.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/iot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          talhaoId,
          valor: Number(valor),
          dataLeitura,
          observacao
        })
      });

      if (res.ok) {
        toast.success("Leitura registrada com sucesso!");
        onSuccess();
        onClose();
        setValor("");
        setObservacao("");
      } else {
        const err = await res.json();
        toast.error(`Erro: ${err.error}`);
      }
    } catch (error) {
      toast.error("Falha ao registrar leitura.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--bg-border)",
        borderRadius: 16,
        padding: 24,
        width: "90%",
        maxWidth: 400,
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
          🌧️ Registrar Pluviometria
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>
              Data da Leitura
            </label>
            <input 
              type="date"
              required
              value={dataLeitura}
              onChange={(e) => setDataLeitura(e.target.value)}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8,
                background: "var(--bg-surface)", border: "1px solid var(--bg-border)",
                color: "var(--text-primary)", outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>
              Volume (mm)
            </label>
            <input 
              type="number"
              step="0.1"
              required
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ex: 15.5"
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8,
                background: "var(--bg-surface)", border: "1px solid var(--bg-border)",
                color: "var(--text-primary)", outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>
              Observação (Opcional)
            </label>
            <input 
              type="text"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Chuva forte à tarde"
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8,
                background: "var(--bg-surface)", border: "1px solid var(--bg-border)",
                color: "var(--text-primary)", outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 8,
                background: "transparent", border: "1px solid var(--bg-border)",
                color: "var(--text-secondary)", fontWeight: 600, cursor: "pointer"
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 8,
                background: "#3b82f6", border: "none",
                color: "#fff", fontWeight: 600, cursor: "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
