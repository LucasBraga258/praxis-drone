"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import MapDraw from "@/app/components/map/MapDraw";

function NovaFazendaForm() {
  const supabase = createClient();
  const router = useRouter();

  const [clientes, setClientes] = useState<any[]>([]);
  const [agronomos, setAgronomos] = useState<any[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [agronomoId, setAgronomoId] = useState("");

  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  
  const [areaValor, setAreaValor] = useState("");
  const [unidadeArea, setUnidadeArea] = useState("ha");

  const [geojson, setGeojson] = useState<any>(null);
  const [center, setCenter] = useState<{lat: number, lng: number} | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Busca de cidade
  const [buscandoCidade, setBuscandoCidade] = useState(false);
  const [cidadesOpcoes, setCidadesOpcoes] = useState<any[]>([]);
  const [flyToLocation, setFlyToLocation] = useState<{lat: number, lng: number} | null>(null);

  const multiplicadoresArea = {
    ha: 1,
    alqueire_sp: 2.42,
    alqueire_mg: 4.84,
    alqueire_ba: 9.68,
    alqueire_norte: 2.72
  };

  useEffect(() => {
    async function carregarDados() {
      const { data: clientesData } = await supabase.from("clientes").select("*").order("nome");
      const { data: agronomosData } = await supabase.from("agronomos").select("*").order("nome");
      setClientes(clientesData || []);
      setAgronomos(agronomosData || []);
    }
    carregarDados();
  }, []);

  let timeoutId = useRef<any>(null);
  const buscarCidades = (query: string) => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(async () => {
      setBuscandoCidade(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(query)}&country=Brazil&format=json&addressdetails=1&limit=5`);
        const data = await res.json();
        setCidadesOpcoes(data || []);
      } catch (e) {
        console.error(e);
      }
      setBuscandoCidade(false);
    }, 600);
  };

  const selecionarCidade = (opcao: any) => {
    const nomeCidade = opcao.address?.city || opcao.address?.town || opcao.address?.village || opcao.name;
    const nomeEstado = opcao.address?.state || "";
    setCidade(nomeCidade);
    setEstado(nomeEstado);
    setCidadesOpcoes([]);
    setFlyToLocation({ lat: parseFloat(opcao.lat), lng: parseFloat(opcao.lon) });
  };

  async function salvarFazenda() {
    if (!nome) {
      alert("Por favor, preencha o nome da fazenda.");
      return;
    }
    if (!geojson) {
      alert("Por favor, desenhe os limites da fazenda no mapa.");
      return;
    }

    setSalvando(true);
    const areaFinalHa = areaValor ? Number(areaValor) * (multiplicadoresArea as any)[unidadeArea] : null;

    const { error } = await supabase
      .from("fazendas")
      .insert([
        {
          cliente_id: clienteId ? Number(clienteId) : null,
          agronomo_id: agronomoId ? Number(agronomoId) : null,
          nome,
          cidade,
          estado,
          area_ha: areaFinalHa,
          bbox_geojson: geojson, // standard column name for maps in Praxis
          latitude: center?.lat,
          longitude: center?.lng
        },
      ]);

    if (error) {
      console.error(error);
      alert("Erro ao salvar fazenda: " + error.message);
      setSalvando(false);
      return;
    }

    router.push("/dashboard/fazendas");
    router.refresh();
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
      
      {/* Coluna Esquerda: Formulário */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 24 }}>Dados Cadastrais</h2>
        <div style={{ display: "grid", gap: 20 }}>
          
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Nome da Fazenda</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Fazenda Boa Esperança"
              style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Cliente / Proprietário</label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Agrônomo Responsável</label>
              <select
                value={agronomoId}
                onChange={(e) => setAgronomoId(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
              >
                <option value="">Nenhum agrônomo</option>
                {agronomos.map((agronomo) => (
                  <option key={agronomo.id} value={agronomo.id}>{agronomo.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, position: "relative" }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Cidade</label>
              <input
                value={cidade}
                onChange={(e) => {
                  setCidade(e.target.value);
                  if (e.target.value.length > 2) {
                    buscarCidades(e.target.value);
                  } else {
                    setCidadesOpcoes([]);
                  }
                }}
                placeholder="Busque por uma cidade..."
                style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
              />
              {buscandoCidade && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Buscando...</div>}
              {cidadesOpcoes.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--bg-card)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", marginTop: 4, zIndex: 10, maxHeight: 200, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                  {cidadesOpcoes.map((opcao: any, idx) => {
                    const nomeStr = opcao.display_name.split(",").slice(0, 2).join(",");
                    return (
                      <div 
                        key={idx} 
                        onClick={() => selecionarCidade(opcao)}
                        style={{ padding: "10px 16px", cursor: "pointer", borderBottom: "1px solid var(--bg-border)", fontSize: 13, color: "var(--text-primary)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        {nomeStr}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Estado</label>
              <input
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                placeholder="Ex: GO"
                style={{ width: "100%", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Tamanho da Área</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  value={areaValor}
                  onChange={(e) => setAreaValor(e.target.value)}
                  placeholder="Ex: 500"
                  style={{ flex: 1, padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14 }}
                />
                <select
                  value={unidadeArea}
                  onChange={(e) => setUnidadeArea(e.target.value)}
                  style={{ width: "120px", padding: "12px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 13 }}
                >
                  <option value="ha">Hectares</option>
                  <option value="alqueire_sp">Alqueires (SP/PR/SC - 2.42ha)</option>
                  <option value="alqueire_mg">Alqueirões (MG/GO/RJ - 4.84ha)</option>
                  <option value="alqueire_ba">Alqueirão (BA - 9.68ha)</option>
                  <option value="alqueire_norte">Alqueire do Norte (2.72ha)</option>
                </select>
              </div>
              {areaValor && unidadeArea !== "ha" && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                  Equivale a <strong>{(Number(areaValor) * (multiplicadoresArea as any)[unidadeArea]).toFixed(2)} hectares</strong> no sistema.
                </div>
              )}
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
              onClick={salvarFazenda}
              disabled={salvando}
              style={{ padding: "12px 24px", background: "var(--praxis-green-600)", border: "none", color: "#fff", borderRadius: "var(--radius-md)", fontWeight: 700, cursor: "pointer", opacity: salvando ? 0.7 : 1 }}
            >
              {salvando ? "Salvando..." : "Salvar Fazenda"}
            </button>
          </div>

        </div>
      </div>

      {/* Coluna Direita: Mapa */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "rgba(74, 222, 128, 0.1)", border: "1px solid rgba(74, 222, 128, 0.2)", borderRadius: "var(--radius-md)", padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ fontSize: 24 }}>🗺️</div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--praxis-green-400)", marginBottom: 4 }}>Demarcação Geográfica</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Use a ferramenta de polígono no mapa abaixo para desenhar os limites exatos da sua fazenda. Esta demarcação alimentará o motor espacial da Praxis para buscas automáticas de satélite.
            </p>
          </div>
        </div>

        <MapDraw 
          height="500px" 
          drawType="polygon" 
          flyToLocation={flyToLocation}
          onDrawComplete={(geojson: any, center: {lat: number, lng: number}, areaHa?: number) => {
            setGeojson(geojson);
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
            Polígono demarcado com sucesso!
          </div>
        )}
      </div>

    </div>
  );
}

export default function NovaFazendaPage() {
  return (
    <main className="praxis-content" style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
            <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Dashboard</Link>
            {" / "}
            <Link href="/dashboard/fazendas" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Fazendas</Link>
            {" / "}
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Nova Fazenda</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)" }}>
            📍 Cadastrar Nova Fazenda
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, marginTop: 4 }}>
            Insira os dados cadastrais e desenhe o polígono da propriedade.
          </p>
        </div>

        <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Carregando formulário...</div>}>
          <NovaFazendaForm />
        </Suspense>

      </div>
    </main>
  );
}