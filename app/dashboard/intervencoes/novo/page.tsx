"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function IntervencaoForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTalhaoId = searchParams.get("talhao_id");

  const [talhoes, setTalhoes] = useState<any[]>([]);
  const [pragas, setPragas] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);

  const [talhaoId, setTalhaoId] = useState(initialTalhaoId || "");
  const [pragaId, setPragaId] = useState("");
  const [dataIntervencao, setDataIntervencao] = useState(new Date().toISOString().split("T")[0]);
  const [tipo, setTipo] = useState("Aplicação de Defensivo");
  const [produto, setProduto] = useState("");
  const [dose, setDose] = useState("");
  const [areaAplicada, setAreaAplicada] = useState("");
  const [custo, setCusto] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function carregar() {
      const { data: tData } = await supabase
        .from("talhoes")
        .select("id, nome, fazenda_id, fazendas(nome)")
        .order("nome");
      setTalhoes(tData || []);
      
      if (initialTalhaoId && !talhaoId) {
        setTalhaoId(initialTalhaoId);
      }

      const { data: pData } = await supabase.from("pragas").select("id, nome, talhao_id").order("nome");
      setPragas(pData || []);

      const { data: eData } = await supabase.from("empresas_parceiras").select("*").order("nome");
      setEmpresas(eData || []);
    }
    carregar();
  }, [initialTalhaoId]);

  async function salvar() {
    if (!talhaoId || !tipo) {
      alert("Preencha o talhão e o tipo de intervenção.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("intervencoes").insert({
      talhao_id: Number(talhaoId),
      praga_id: pragaId ? Number(pragaId) : null,
      data_realizacao: dataIntervencao,
      data_intervencao: dataIntervencao, // compatibilidade
      tipo,
      produto,
      dose,
      area_aplicada: areaAplicada ? Number(areaAplicada) : null,
      custo: custo ? Number(custo) : null,
      empresa_id: empresaId ? Number(empresaId) : null,
      responsavel,
      observacoes,
      status: "CONCLUÍDO", // Default to completed if entering manually
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

  // Filtrar pragas para mostrar apenas as do talhão selecionado, ou todas se o schema não suportar
  const pragasFiltradas = talhaoId ? pragas.filter(p => !p.talhao_id || String(p.talhao_id) === String(talhaoId)) : pragas;

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: 32 }}>
      <div style={{ display: "grid", gap: 20 }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Data da Intervenção</label>
            <input
              type="date"
              value={dataIntervencao}
              onChange={(e) => setDataIntervencao(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Tipo de Intervenção</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
            >
              <option value="Aplicação de Defensivo">Aplicação de Defensivo</option>
              <option value="Adubação">Adubação</option>
              <option value="Tratos Culturais">Tratos Culturais</option>
              <option value="Irrigação">Irrigação</option>
              <option value="Colheita">Colheita</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Praga/Doença Alvo (Opcional)</label>
            <select
              value={pragaId}
              onChange={(e) => setPragaId(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
            >
              <option value="">Nenhuma (Prevenção / Outros)</option>
              {pragasFiltradas.map((praga) => (
                <option key={praga.id} value={praga.id}>
                  {praga.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Produto Utilizado</label>
            <input
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
              placeholder="Ex: Glifosato, NPK..."
              style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Dose (L/ha ou kg/ha)</label>
            <input
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="Ex: 2.5 L/ha"
              style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Área Aplicada (ha)</label>
            <input
              type="number"
              value={areaAplicada}
              onChange={(e) => setAreaAplicada(e.target.value)}
              placeholder="0.0"
              style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Custo Estimado (R$)</label>
            <input
              type="number"
              value={custo}
              onChange={(e) => setCusto(e.target.value)}
              placeholder="0.00"
              style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Empresa Executora</label>
            <select
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
            >
              <option value="">Própria / Nenhuma</option>
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Responsável / Operador</label>
          <input
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            placeholder="Nome de quem executou"
            style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Observações</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Detalhes adicionais (clima durante aplicação, etc.)"
            rows={3}
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
            {loading ? "Salvando..." : "Registrar Intervenção"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function NovaIntervencaoPage() {
  return (
    <main className="praxis-content" style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
            <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Dashboard</Link>
            {" / "}
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Nova Intervenção</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>
            🧪 Registrar Intervenção
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            Adicione tratos culturais, pulverizações e aplicações à linha do tempo do talhão.
          </p>
        </div>

        <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Carregando formulário...</div>}>
          <IntervencaoForm />
        </Suspense>

      </div>
    </main>
  );
}