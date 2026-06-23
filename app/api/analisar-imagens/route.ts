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
Você é um especialista em agricultura de precisão.

Analise as imagens recebidas.

IMPORTANTE:

- Considere APENAS a área agrícola do talhão.
- Ignore completamente:
  - fundo branco
  - áreas urbanas
  - ruas
  - construções
  - sombras
  - elementos fora da lavoura

Prioridade das análises:

1. Mapa VARI (principal fonte)
2. Ortomosaico RGB (validação visual)
3. Modelo de Elevação (contexto topográfico)

Retorne SOMENTE JSON:

{
  "alto_vigor": 0,
  "medio_vigor": 0,
  "baixo_vigor": 0,

  "observacoes": "",

  "prioridade": "",

  "proximo_voo_recomendado": 0,

  "recomendacoes": [
    ""
  ]
}

Defina prioridade usando:

- Alta:
  baixo_vigor > 20%

- Média:
  baixo_vigor entre 10% e 20%

- Baixa:
  baixo_vigor menor que 10%

Defina proximo_voo_recomendado:

- Alta = 15 dias
- Média = 30 dias
- Baixa = 45 dias

Regras:

- As porcentagens devem somar aproximadamente 100.
- Observações devem ser objetivas.
- Recomendações devem ser práticas para o produtor.
- A prioridade deve ser: Alta, Média ou Baixa.

O próximo monitoramento recomendado deve ser:
15, 30 ou 45 dias.

As recomendações devem ser retornadas como ARRAY.

Exemplo:

[
  "Realizar análise de solo",
  "Verificar drenagem",
  "Executar novo monitoramento em 20 dias"
]

Máximo 4 recomendações.

Cada recomendação deve ser curta e objetiva.

Não escreva texto fora do JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        prompt,
        projeto.ortomosaico_img_url || "",
        projeto.ndvi_img_url || "",
        projeto.elevacao_img_url || "",
      ],
    });

    const texto = response.text ?? "";

    let resultado;

    try {
      resultado = JSON.parse(
        texto
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim()
      );
    } catch {
      return NextResponse.json({
        error: "Gemini retornou formato inválido",
        resposta: texto,
      });
    }

    const { error } = await supabase
  .from("projetos")
  .update({
    alto_vigor: resultado.alto_vigor,
    medio_vigor: resultado.medio_vigor,
    baixo_vigor: resultado.baixo_vigor,

    observacoes: resultado.observacoes,

    recomendacoes: resultado.recomendacoes,

    prioridade: resultado.prioridade,

    proximo_voo_recomendado:
      resultado.proximo_voo_recomendado,

    analise_status: "Concluído",
  })
  .eq("id", projetoId);
 let statusSaude = "Saudável";

const baixoVigor =
  Number(resultado.baixo_vigor || 0);

if (baixoVigor > 30) {
  statusSaude = "Crítica";
}
else if (baixoVigor > 10) {
  statusSaude = "Atenção";
}

await supabase
  .from("fazendas")
  .update({
    status_saude: statusSaude,
  })
  .eq("id", projeto.fazenda_id);
  const dataBase = new Date(projeto.data_voo);

dataBase.setDate(
  dataBase.getDate() +
  Number(resultado.proximo_voo_recomendado)
);

const proximoVoo = dataBase
  .toISOString()
  .split("T")[0];

await supabase
  .from("fazendas")
  .update({
    status_saude: statusSaude,
    proximo_voo: proximoVoo,
  })
  .eq("id", projeto.fazenda_id);

    if (error) {
      return NextResponse.json({
        error: error.message,
      });
    }

    return NextResponse.json({
      message: "Análise concluída com sucesso",
      resultado,
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