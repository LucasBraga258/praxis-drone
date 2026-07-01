import { createClient } from "../supabase/client";

const supabase = createClient();
export async function carregarDashboard(periodo: number) {
  const dataLimite = new Date();

  dataLimite.setDate(
    dataLimite.getDate() - periodo
  );

  const [
    clientes,
    fazendas,
    projetos,
    agronomos,
    empresas,
    pragas,
    intervencoes,
    alertas,
    proximosVoos,
    fazendasArea,
  ] = await Promise.all([

    supabase
      .from("clientes")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("fazendas")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("projetos")
      .select("*", {
        count: "exact",
        head: true,
      })
      .gte(
        "data_voo",
        dataLimite
          .toISOString()
          .split("T")[0]
      ),

    supabase
      .from("agronomos")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("empresas_parceiras")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("pragas")
      .select("*", {
        count: "exact",
        head: true,
      })
      .neq("status", "Resolvida"),

    supabase
      .from("intervencoes")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("notificacoes")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("lida", false),

    supabase
      .from("fazendas")
      .select("*")
      .not("proximo_voo", "is", null)
      .order("proximo_voo")
      .limit(10),

    supabase
      .from("fazendas")
      .select("area_ha"),

  ]);

  const areaMonitorada =
    fazendasArea.data?.reduce(
      (total, fazenda) =>
        total + Number(fazenda.area_ha || 0),
      0
    ) || 0;

  const monitoramentosVencidos =
    proximosVoos.data?.filter(
      (fazenda) =>
        new Date(fazenda.proximo_voo) <
        new Date()
    ) || [];

  return {
    clientes: clientes.count || 0,
    fazendas: fazendas.count || 0,
    projetos: projetos.count || 0,
    agronomos: agronomos.count || 0,
    empresas: empresas.count || 0,
    pragasAtivas: pragas.count || 0,
    intervencoes: intervencoes.count || 0,
    alertasPendentes: alertas.count || 0,

    areaMonitorada,

    proximosVoos:
      proximosVoos.data || [],

    monitoramentosVencidos,
  };
}