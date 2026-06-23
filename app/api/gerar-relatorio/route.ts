import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { projetoId } = await req.json();

    const { data: projeto } = await supabase
      .from("projetos")
      .select("*")
      .eq("id", projetoId)
      .single();

    if (!projeto) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    const prompt = `
Crie um relatório agronômico em HTML.

Dados:

Alto vigor: ${projeto.alto_vigor}%
Médio vigor: ${projeto.medio_vigor}%
Baixo vigor: ${projeto.baixo_vigor}%

Observações:
${projeto.observacoes}

Recomendações:
${JSON.stringify(projeto.recomendacoes)}

Nível de confiança:
${projeto.nivel_confianca}%

Retorne SOMENTE HTML.

Estrutura obrigatória:

<h1>Relatório Agronômico</h1>

<h2>Resumo Executivo</h2>

<h2>Diagnóstico Agronômico</h2>

<h2>Recomendações Técnicas</h2>

<h2>Conclusão</h2>

Não inclua imagens.
Não inclua CSS.
Retorne apenas o conteúdo HTML.

Sem markdown.
Sem \`\`\`.
Somente HTML válido.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const html = response.text ?? "";

    const { error } = await supabase
      .from("projetos")
      .update({
        relatorio_html: html,
      })
      .eq("id", projetoId);

    if (error) {
      return NextResponse.json({
        error: error.message,
      });
    }

    return NextResponse.json({
      sucesso: true,
    });

  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}