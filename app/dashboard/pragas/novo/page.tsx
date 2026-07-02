"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function PragaForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTalhaoId = searchParams.get("talhao_id");

  const [talhoes, setTalhoes] = useState<any[]>([]);
  const [talhaoId, setTalhaoId] = useState(initialTalhaoId || "");
  const [nome, setNome] = useState("");
  const [nivel, setNivel] = useState("Baixo");
  const [status, setStatus] = useState("Em Monitoramento");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("talhoes")
        .select("id, nome, fazenda_id, fazendas(nome)")
        .order("nome");
      
      setTalhoes(data || []);
      
      if (initialTalhaoId && !talhaoId) {
        setTalhaoId(initialTalhaoId);
      }
    }
    carregar();
  }, [initialTalhaoId]);

  async function salvar() {
    if (!talhaoId || !nome) {
      alert("Preencha o talhão e o nome da praga/doença.");
      return;
    }

    setLoading(true);
    
    // Pegar fazenda_id correspondente
    const talhao = talhoes.find(t => String(t.id) === String(talhaoId));
    const fazendaId = talhao?.fazenda_id;

    const { error } = await supabase.from("pragas").insert({
      fazenda_id: fazendaId ? Number(fazendaId) : null,
      talhao_id: Number(talhaoId),
      nome,
      nivel_infestacao: nivel,
      gravidade: nivel, // backward compat with other column name
      status,
      data_identificacao: data,
      observacoes,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Erro ao salvar: " + error.message);
      return;
    }

    router.push(`/dashboard/talhoes/${talhaoId}`);
    router.refresh();
  }

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: 32 }}>
      <div style={{ display: "grid", gap: 20 }}>
        
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Talhão</label>
          <select
            value={talhaoId}
            onChange={(e) => setTalhaoId(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
          >
            <option value="">Selecione o Talhão</option>
            {talhoes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome} (Fazenda: {t.fazendas?.nome})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Nome da Praga / Doença</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Ferrugem Asiática, Lagarta do Cartucho..."
            style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Data de Identificação</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Nível de Infestação</label>
            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
            >
              <option value="Baixo">Baixo</option>
              <option value="Médio">Médio</option>
              <option value="Alto">Alto</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
          >
            <option value="Em Monitoramento">Em Monitoramento</option>
            <option value="Tratada">Tratada</option>
            <option value="Resolvida">Resolvida</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Observações</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Detalhes adicionais..."
            rows={4}
            style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14, resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 12 }}>
          <button
            onClick={() => router.back()}
            style={{ padding: "12px 24px", background: "transparent", border: "1px solid var(--bg-border)", color: "var(--text-primary)", borderRadius: "var(--radius-md)", fontWeight: 600, cursor: "pointer" }}
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={loading}
            style={{ padding: "12px 24px", background: "var(--praxis-green-600)", border: "none", color: "#fff", borderRadius: "var(--radius-md)", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Salvando..." : "Registrar Praga/Doença"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function NovaPragaPage() {
  return (
    <main className="praxis-content" style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
            <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Dashboard</Link>
            {" / "}
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Nova Praga</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>
            🐛 Registrar Praga ou Doença
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            Adicione uma ocorrência fitossanitária ao histórico do talhão.
          </p>
        </div>

        <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Carregando formulário...</div>}>
          <PragaForm />
        </Suspense>

      </div>
    </main>
  );
}