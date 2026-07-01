"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Card from "@/app/components/ui/Card";

export default function EditarFazendaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = createClient();
  const { id } = use(params);
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [areaHa, setAreaHa] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [agronomoId, setAgronomoId] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [cultura, setCultura] = useState("");
  const [frequencia, setFrequencia] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const [clientes, setClientes] = useState<any[]>([]);
  const [agronomos, setAgronomos] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("fazendas")
        .select("*")
        .eq("id", id)
        .single();

      const { data: clientesData } = await supabase.from("clientes").select("*").order("nome");
      const { data: agronomosData } = await supabase.from("agronomos").select("*").order("nome");
      const { data: empresasData } = await supabase.from("empresas_parceiras").select("*").order("nome");

      setClientes(clientesData || []);
      setAgronomos(agronomosData || []);
      setEmpresas(empresasData || []);

      if (!data) return;

      setNome(data.nome || "");
      setCidade(data.cidade || "");
      setEstado(data.estado || "");
      setAreaHa(String(data.area_ha || ""));
      setClienteId(String(data.cliente_id || ""));
      setAgronomoId(String(data.agronomo_id || ""));
      setEmpresaId(String(data.empresa_parceira_id || ""));
      setCultura(data.cultura || "");
      setFrequencia(String(data.frequencia_monitoramento || ""));
      setCarregando(false);
    }
    carregar();
  }, [id]);

  async function salvar() {
    setSalvando(true);

    const { error } = await supabase
      .from("fazendas")
      .update({
        nome,
        cidade,
        estado,
        area_ha: Number(areaHa),
        cliente_id: clienteId ? Number(clienteId) : null,
        agronomo_id: agronomoId ? Number(agronomoId) : null,
        empresa_parceira_id: empresaId ? Number(empresaId) : null,
        cultura,
        frequencia_monitoramento: frequencia ? Number(frequencia) : null,
      })
      .eq("id", id);

    if (error) {
      alert("Erro ao salvar: " + error.message);
      setSalvando(false);
      return;
    }

    router.push(`/dashboard/fazendas/${id}`);
    router.refresh();
  }

  if (carregando) {
    return (
      <main className="praxis-content" style={{ background: "var(--bg-base)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p className="text-slate-400 font-medium">Carregando dados da fazenda...</p>
      </main>
    );
  }

  return (
    <main className="praxis-content" style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 60 }}>
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            style={{
              padding: "10px 16px",
              background: "var(--bg-surface)",
              border: "1px solid var(--bg-border)",
              color: "var(--text-secondary)",
              borderRadius: "var(--radius-md)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            ← Voltar
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Editar Fazenda
          </h1>
        </div>

        <Card>
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Nome da Fazenda *
                </label>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px", background: "var(--bg-base)",
                    border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none"
                  }}
                  placeholder="Ex: Fazenda Boa Vista"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Área Total (hectares) *
                </label>
                <input
                  type="number"
                  value={areaHa}
                  onChange={(e) => setAreaHa(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px", background: "var(--bg-base)",
                    border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none"
                  }}
                  placeholder="Ex: 1500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Cidade
                </label>
                <input
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px", background: "var(--bg-base)",
                    border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none"
                  }}
                  placeholder="Ex: Ribeirão Preto"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Estado (UF)
                </label>
                <input
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px", background: "var(--bg-base)",
                    border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none"
                  }}
                  placeholder="Ex: SP"
                  maxLength={2}
                />
              </div>
            </div>

            <hr style={{ border: 0, borderTop: "1px solid var(--bg-border)", margin: "24px 0" }} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Cliente Proprietário
                </label>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px", background: "var(--bg-base)",
                    border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="">Selecione...</option>
                  {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Agrônomo Responsável
                </label>
                <select
                  value={agronomoId}
                  onChange={(e) => setAgronomoId(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px", background: "var(--bg-base)",
                    border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="">Selecione...</option>
                  {agronomos.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Empresa Parceira
                </label>
                <select
                  value={empresaId}
                  onChange={(e) => setEmpresaId(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px", background: "var(--bg-base)",
                    border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="">Selecione...</option>
                  {empresas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
              </div>
            </div>

            <hr style={{ border: 0, borderTop: "1px solid var(--bg-border)", margin: "24px 0" }} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Cultura Predominante
                </label>
                <input
                  value={cultura}
                  onChange={(e) => setCultura(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px", background: "var(--bg-base)",
                    border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none"
                  }}
                  placeholder="Ex: Soja, Milho, Cana"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Frequência de Monitoramento (dias)
                </label>
                <input
                  type="number"
                  value={frequencia}
                  onChange={(e) => setFrequencia(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px", background: "var(--bg-base)",
                    border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none"
                  }}
                  placeholder="Ex: 30"
                />
              </div>
            </div>
            
          </div>
        </Card>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: "12px 24px",
              background: "transparent",
              color: "var(--text-secondary)",
              border: "1px solid var(--bg-border)",
              borderRadius: "var(--radius-md)",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            Cancelar
          </button>

          <button
            onClick={salvar}
            disabled={salvando || !nome || !areaHa}
            style={{
              padding: "12px 32px",
              background: salvando || !nome || !areaHa ? "var(--bg-hover)" : "linear-gradient(135deg, #22c55e, #16a34a)",
              color: salvando || !nome || !areaHa ? "var(--text-muted)" : "#fff",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontWeight: 700,
              cursor: salvando || !nome || !areaHa ? "not-allowed" : "pointer",
              boxShadow: salvando || !nome || !areaHa ? "none" : "0 4px 14px rgba(34,197,94,0.25)",
              transition: "all 0.2s"
            }}
          >
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>

      </div>
    </main>
  );
}