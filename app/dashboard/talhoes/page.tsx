import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";

export default async function TalhoesListPage() {
  const supabase = await createClient();
  const { data: talhoes } = await supabase
    .from("talhoes")
    .select(`
      *,
      fazendas(id, nome)
    `)
    .order("nome");

  return (
    <main className="praxis-content" style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
              Meus Talhões
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              Gerencie e acesse todos os talhões cadastrados
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {talhoes?.map((talhao) => {
            const fazendaNome = (talhao as any).fazendas?.nome || "Fazenda Desconhecida";
            
            return (
              <Link key={talhao.id} href={`/dashboard/talhoes/${talhao.id}`} style={{ textDecoration: "none" }}>
                <div style={{ cursor: "pointer", transition: "transform 0.2s", height: "100%" }}>
                  <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
                        {talhao.nome}
                      </h3>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        {fazendaNome}
                      </span>
                    </div>
                    {talhao.area_hectares && (
                      <Badge color="gray">{talhao.area_hectares} ha</Badge>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    {talhao.cultura && (
                      <Badge color="green">🌾 {talhao.cultura}</Badge>
                    )}
                    {talhao.variedade && (
                      <Badge color="gray">{talhao.variedade}</Badge>
                    )}
                  </div>
                </Card>
                </div>
              </Link>
            );
          })}

          {talhoes?.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
              Nenhum talhão encontrado.
            </div>
          )}
        </div>
        
      </div>
    </main>
  );
}
