"use client";

import { useEffect, useState, Suspense, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import MapDraw from "@/app/components/map/MapDraw";

function EditarTalhaoForm({ talhaoId }: { talhaoId: string }) {
  const supabase = createClient();
  const router = useRouter();

  const [talhao, setTalhao] = useState<any>(null);
  const [fazenda, setFazenda] = useState<any>(null);
  
  const [nome, setNome] = useState("");
  const [cultura, setCultura] = useState("");
  
  const [areaValor, setAreaValor] = useState("");
  const [unidadeArea, setUnidadeArea] = useState("ha");
  
  const [geojson, setGeojson] = useState<any>(null);
  const [center, setCenter] = useState<{lat: number, lng: number} | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregar() {
      const { data: t } = await supabase.from("talhoes").select("*, fazendas(*)").eq("id", talhaoId).single();
      if (t) {
        setTalhao(t);
        setFazenda(t.fazendas);
        setNome(t.nome || "");
        setCultura(t.cultura || "");
        setAreaValor(t.area_hectares || t.area || "");
        setGeojson(t.bbox_geojson || t.limites_geojson || null);
        if (t.latitude && t.longitude) {
          setCenter({ lat: t.latitude, lng: t.longitude });
        }
      }
    }
    carregar();
  }, [talhaoId]);

  async function salvar() {
    if (!nome) {
      alert("Por favor, informe o nome do talhão.");
      return;
    }

    setSalvando(true);
    const areaFinalHa = areaValor ? Number(areaValor) : null;

    const { error } = await supabase.from("talhoes").update({
        nome,
        cultura,
        area_hectares: areaFinalHa,
        bbox_geojson: geojson,
        latitude: center?.lat,
        longitude: center?.lng
      }).eq("id", talhaoId);

    if (error) {
      alert(`Erro ao salvar talhão: ${error.message}`);
      setSalvando(false);
      return;
    }

    router.push(`/dashboard/talhoes/${talhaoId}`);
    router.refresh();
  }

  if (!talhao) return <div>Carregando...</div>;

  const existingFazendaGeojson = fazenda?.limites_geojson || fazenda?.bbox_geojson || null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
      
      {/* Coluna Esquerda: Formulário */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 24 }}>Dados do Talhão</h2>
        <div style={{ display: "grid", gap: 20 }}>
          
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Nome ou Número do Talhão</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Talhão 01 - Norte"
              style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Cultura Principal</label>
              <input
                value={cultura}
                onChange={(e) => setCultura(e.target.value)}
                placeholder="Ex: Soja, Milho, Cana"
                style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Tamanho da Área</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  step="0.01"
                  value={areaValor}
                  onChange={(e) => setAreaValor(e.target.value)}
                  placeholder="Ex: 150.5"
                  style={{ flex: 1, padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
                />
                <select
                  value={unidadeArea}
                  onChange={(e) => setUnidadeArea(e.target.value)}
                  style={{ width: "120px", padding: "12px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 13 }}
                >
                  <option value="ha">Hectares</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
            <button
              onClick={() => router.back()}
              style={{ padding: "12px 24px", background: "transparent", border: "1px solid var(--bg-border)", color: "var(--text-primary)", borderRadius: "var(--radius-md)", fontWeight: 600, cursor: "pointer" }}
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={salvando}
              style={{ padding: "12px 24px", background: "var(--praxis-green-600)", border: "none", color: "#fff", borderRadius: "var(--radius-md)", fontWeight: 700, cursor: "pointer", opacity: salvando ? 0.7 : 1 }}
            >
              {salvando ? "Salvando..." : "Salvar Talhão"}
            </button>
          </div>

        </div>
      </div>

      {/* Coluna Direita: Mapa */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "rgba(74, 222, 128, 0.1)", border: "1px solid rgba(74, 222, 128, 0.2)", borderRadius: "var(--radius-md)", padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ fontSize: 24 }}>🗺️</div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--praxis-green-400)", marginBottom: 4 }}>Demarcação do Talhão</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Desenhe o polígono que delimita este talhão. Se a fazenda selecionada já possuir um polígono salvo, ele aparecerá aqui para te ajudar a guiar o desenho.
            </p>
          </div>
        </div>

        <MapDraw 
          height="500px" 
          drawType="polygon" 
          existingGeojson={geojson ? undefined : existingFazendaGeojson}
          initialGeojson={geojson}
          onDrawComplete={(novoGeojson: any, center: {lat: number, lng: number}, areaHa?: number) => {
            setGeojson(novoGeojson);
            setCenter(center);
            if (areaHa && areaHa > 0) {
              setAreaValor(areaHa.toFixed(2));
              setUnidadeArea("ha");
            }
          }} 
        />
        
        {geojson && (
          <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--praxis-green-500)" }}></div>
            Polígono demarcado!
          </div>
        )}
      </div>

    </div>
  );
}

export default function EditarTalhaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  return (
    <main className="praxis-content" style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
            <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Dashboard</Link>
            {" / "}
            <Link href="/dashboard/talhoes" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Talhões</Link>
            {" / "}
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Editar</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)" }}>
            ✏️ Editar Talhão
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, marginTop: 4 }}>
            Atualize as informações do talhão ou demarque sua área no mapa.
          </p>
        </div>

        <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Carregando formulário...</div>}>
          <EditarTalhaoForm talhaoId={id} />
        </Suspense>

      </div>
    </main>
  );
}
