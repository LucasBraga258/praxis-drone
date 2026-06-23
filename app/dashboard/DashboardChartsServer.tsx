import { supabase } from "../../lib/supabase";
import DashboardCharts from "./DashboardCharts";

export default async function DashboardChartsServer() {

  const { data: fazendas } = await supabase
    .from("fazendas")
    .select("status_saude,cultura");

  const { data: projetos } = await supabase
    .from("projetos")
    .select("data_voo");

  const saudaveis =
    fazendas?.filter(
      (f) => f.status_saude === "Saudável"
    ).length || 0;

  const atencao =
    fazendas?.filter(
      (f) => f.status_saude === "Atenção"
    ).length || 0;

  const criticas =
    fazendas?.filter(
      (f) => f.status_saude === "Crítica"
    ).length || 0;

  const culturasMap = new Map();

  fazendas?.forEach((fazenda) => {

    const cultura =
      fazenda.cultura || "Não definida";

    culturasMap.set(
      cultura,
      (culturasMap.get(cultura) || 0) + 1
    );
  });

  const culturasData =
    Array.from(culturasMap.entries()).map(
      ([nome, valor]) => ({
        nome,
        valor,
      })
    );

  const meses = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  const monitoramentos = meses.map(
    (mes) => ({
      mes,
      voos: 0,
    })
  );

  projetos?.forEach((projeto) => {

    if (!projeto.data_voo) return;

    const data =
      new Date(projeto.data_voo);

    const mes =
      data.getMonth();

    monitoramentos[mes].voos++;
  });

  return (
    <DashboardCharts
      saudeData={[
        {
          nome: "Saudáveis",
          valor: saudaveis,
        },
        {
          nome: "Atenção",
          valor: atencao,
        },
        {
          nome: "Críticas",
          valor: criticas,
        },
      ]}
      culturasData={culturasData}
      monitoramentosData={monitoramentos}
    />
  );
}