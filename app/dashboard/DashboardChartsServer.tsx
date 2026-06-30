import { supabase } from "../../lib/supabase";
import DashboardCharts from "./DashboardCharts";

export default async function DashboardChartsServer() {
  const [{ data: fazendas }, { data: projetos }] = await Promise.all([
    supabase.from("fazendas").select("status_saude, cultura"),
    supabase.from("projetos").select("data_voo, status"),
  ]);

  const saudaveis = fazendas?.filter((f) => f.status_saude === "Saudável").length || 0;
  const atencao   = fazendas?.filter((f) => f.status_saude === "Atenção").length || 0;
  const criticas  = fazendas?.filter((f) => f.status_saude === "Crítica").length || 0;

  const culturasMap = new Map<string, number>();
  fazendas?.forEach((f) => {
    const c = f.cultura || "Não definida";
    culturasMap.set(c, (culturasMap.get(c) || 0) + 1);
  });

  const culturasData = Array.from(culturasMap.entries()).map(([nome, valor]) => ({ nome, valor }));

  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const monitoramentos = meses.map((mes) => ({ mes, voos: 0 }));

  projetos?.forEach((p) => {
    if (!p.data_voo) return;
    const mes = new Date(p.data_voo).getMonth();
    monitoramentos[mes].voos++;
  });

  const concluidas = projetos?.filter((p) => p.status === "Concluído").length || 0;
  const emAndamento = projetos?.filter((p) => p.status === "Processando" || p.status === "Upload").length || 0;
  const erros = projetos?.filter((p) => p.status === "Erro").length || 0;

  return (
    <DashboardCharts
      saudeData={[
        { nome: "Saudáveis", valor: saudaveis },
        { nome: "Atenção",   valor: atencao },
        { nome: "Críticas",  valor: criticas },
      ]}
      culturasData={culturasData}
      monitoramentosData={monitoramentos}
      statusData={[
        { nome: "Concluídas",   valor: concluidas },
        { nome: "Em Andamento", valor: emAndamento },
        { nome: "Com Erros",    valor: erros },
      ]}
    />
  );
}