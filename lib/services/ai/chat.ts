import { GoogleGenAI } from "@google/genai";
import { supabase } from "../../supabase";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_KEY! });

interface ChatContext {
  fazendaId?: number;
  talhaoId?: number;
  projetoId?: number;
}

/**
 * Busca todo o contexto relevante da propriedade para montar o prompt da IA.
 */
export async function buscarContextoPropriedade(ctx: ChatContext): Promise<string> {
  const partes: string[] = [];

  // Contexto geral
  const [
    { data: fazendas },
    { data: clientes },
    { count: totalMissoes },
  ] = await Promise.all([
    supabase.from("fazendas").select("id, nome, area_ha, cultura, status_saude, municipio, uf, proximo_voo").limit(20),
    supabase.from("clientes").select("id, nome").limit(20),
    supabase.from("projetos").select("*", { count: "exact", head: true }),
  ]);

  partes.push(`## Plataforma Praxis — Contexto Geral
- Total de missões registradas: ${totalMissoes || 0}
- Clientes cadastrados: ${clientes?.map((c) => c.nome).join(", ") || "Nenhum"}
`);

  if (fazendas && fazendas.length > 0) {
    partes.push("## Fazendas\n" + fazendas.map((f) =>
      `- **${f.nome}** (${f.municipio || ""}/${f.uf || ""}) — ${f.area_ha || 0} ha — Cultura: ${f.cultura || "—"} — Saúde: ${f.status_saude || "—"} — Próximo Voo: ${f.proximo_voo || "—"}`
    ).join("\n"));
  }

  // Contexto específico se selecionado
  if (ctx.fazendaId) {
    const [
      { data: fazenda },
      { data: talhoes },
      { data: projetos },
      { data: intervencoes },
      { data: pragas },
    ] = await Promise.all([
      supabase.from("fazendas").select("*").eq("id", ctx.fazendaId).single(),
      supabase.from("talhoes").select("*").eq("fazenda_id", ctx.fazendaId),
      supabase.from("projetos").select("*").eq("fazenda_id", ctx.fazendaId).order("data_voo", { ascending: false }).limit(10),
      supabase.from("intervencoes").select("*").eq("fazenda_id", ctx.fazendaId).order("data_intervencao", { ascending: false }).limit(10),
      supabase.from("pragas").select("*").eq("fazenda_id", ctx.fazendaId).neq("status", "Resolvida"),
    ]);

    if (fazenda) {
      partes.push(`\n## Fazenda Selecionada: ${fazenda.nome}
- Área: ${fazenda.area_ha || "—"} ha
- Município: ${fazenda.municipio || "—"}/${fazenda.uf || "—"}
- Cultura: ${fazenda.cultura || "—"}
- Saúde: ${fazenda.status_saude || "—"}
- Próximo Voo: ${fazenda.proximo_voo || "—"}
`);
    }

    if (talhoes && talhoes.length > 0) {
      partes.push("## Talhões\n" + talhoes.map((t) =>
        `- **${t.nome}** — Cultura: ${t.cultura || "—"} — Área: ${t.area || "—"} ha — Safra: ${t.safra || "—"}`
      ).join("\n"));
    }

    if (projetos && projetos.length > 0) {
      partes.push("## Missões Recentes\n" + projetos.map((p) =>
        `- Missão **${p.codigo}** em ${p.data_voo || "—"} — Status: ${p.status} — Área: ${p.area_mapeada || "—"} ha — Alto Vigor: ${p.alto_vigor || 0}% / Médio: ${p.medio_vigor || 0}% / Baixo: ${p.baixo_vigor || 0}%`
      ).join("\n"));
    }

    if (intervencoes && intervencoes.length > 0) {
      partes.push("## Intervenções\n" + intervencoes.map((i) =>
        `- ${i.data_intervencao || "—"}: ${i.tipo || "Intervenção"} — Produto: ${i.produto || "—"} — Dose: ${i.dose || "—"}`
      ).join("\n"));
    }

    if (pragas && pragas.length > 0) {
      partes.push("## Pragas Ativas\n" + pragas.map((p) =>
        `- ${p.nome || p.tipo || "Praga"} — Severidade: ${p.severidade || "—"} — Status: ${p.status}`
      ).join("\n"));
    }
  }

  if (ctx.talhaoId) {
    const [{ data: talhao }, { data: missoes }] = await Promise.all([
      supabase.from("talhoes").select("*").eq("id", ctx.talhaoId).single(),
      supabase.from("projetos").select("*").eq("talhao_id", ctx.talhaoId).order("data_voo", { ascending: false }).limit(5),
    ]);

    if (talhao) {
      partes.push(`\n## Talhão Selecionado: ${talhao.nome}
- Área: ${talhao.area || "—"} ha
- Cultura: ${talhao.cultura || "—"}
- Variedade: ${talhao.variedade || "—"}
- Safra: ${talhao.safra || "—"}
`);
    }

    if (missoes && missoes.length > 0) {
      partes.push("## Histórico do Talhão\n" + missoes.map((m) =>
        `- ${m.data_voo || "—"}: ${m.codigo} — NDVI Alto: ${m.alto_vigor || 0}% / Médio: ${m.medio_vigor || 0}% / Baixo: ${m.baixo_vigor || 0}%`
      ).join("\n"));
    }
  }

  return partes.join("\n\n");
}

/**
 * Envia uma mensagem para a IA com contexto da propriedade.
 */
export async function enviarMensagemIA(
  pergunta: string,
  historico: { role: "user" | "model"; parts: string }[],
  contexto: string
): Promise<string> {
  const systemInstruction = `Você é o **Assistente Agronômico Praxis** — um especialista em Agricultura de Precisão.

Você tem acesso a dados reais da plataforma Praxis sobre fazendas, talhões, missões de drone, intervenções e pragas.

**Regras:**
- Responda sempre em português brasileiro
- Seja objetivo e profissional, mas acessível ao produtor rural
- NUNCA tome decisões — apenas apresente informações e análises
- Baseie suas respostas nos dados fornecidos
- Se não tiver dados suficientes, diga claramente
- Use formatação markdown quando útil (listas, negrito)
- Responda em no máximo 3 parágrafos, a menos que o usuário peça detalhes

**Contexto atual da plataforma:**
${contexto}`;

  const contents = [
    ...historico.map((h) => ({
      role: h.role,
      parts: [{ text: h.parts }],
    })),
    {
      role: "user" as const,
      parts: [{ text: pergunta }],
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents,
    config: {
      systemInstruction,
      maxOutputTokens: 1024,
      temperature: 0.4,
    },
  });

  return response.text ?? "Não consegui gerar uma resposta. Tente novamente.";
}
