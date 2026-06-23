import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {

    const { data: fazendas } = await supabase
      .from("fazendas")
      .select("*");

    const hoje = new Date();

    for (const fazenda of fazendas || []) {

      // MONITORAMENTO VENCIDO

      if (fazenda.proximo_voo) {

        const dataVoo = new Date(
          fazenda.proximo_voo
        );

        const diferencaDias = Math.floor(
          (
            dataVoo.getTime() -
            hoje.getTime()
          ) /
          (1000 * 60 * 60 * 24)
        );

        if (diferencaDias < 0) {

          await supabase
            .from("notificacoes")
            .upsert({
              chave:
                `monitoramento_vencido_${fazenda.id}`,

              fazenda_id: fazenda.id,

              titulo:
                "Monitoramento vencido",

              descricao:
                `A fazenda ${fazenda.nome} está com monitoramento vencido.`,

              tipo: "critico",
            });

        }

        else if (diferencaDias <= 5) {

          await supabase
            .from("notificacoes")
            .upsert({
              chave:
                `monitoramento_proximo_${fazenda.id}`,

              fazenda_id: fazenda.id,

              titulo:
                "Monitoramento próximo",

              descricao:
                `A fazenda ${fazenda.nome} possui voo previsto em ${diferencaDias} dias.`,

              tipo: "atencao",
            });

        }
      }

      // ÚLTIMO PROJETO

      const { data: projeto } =
        await supabase
          .from("projetos")
          .select("*")
          .eq(
            "fazenda_id",
            fazenda.id
          )
          .order(
            "data_voo",
            {
              ascending: false,
            }
          )
          .limit(1)
          .single();

      if (!projeto) {
        continue;
      }

      // SEM IMAGENS

      if (
        !projeto.ortomosaico_img_url
      ) {

        await supabase
          .from("notificacoes")
          .upsert({
            chave:
              `sem_imagem_${projeto.id}`,

            fazenda_id:
              fazenda.id,

            titulo:
              "Projeto sem imagens",

            descricao:
              `O projeto ${projeto.codigo} ainda não possui imagens enviadas.`,

            tipo:
              "critico",
          });

      }

      // SEM ANÁLISE

      if (
        projeto.analise_status !==
        "Concluído"
      ) {

        await supabase
          .from("notificacoes")
          .upsert({
            chave:
              `sem_analise_${projeto.id}`,

            fazenda_id:
              fazenda.id,

            titulo:
              "Análise pendente",

            descricao:
              `O projeto ${projeto.codigo} ainda não foi analisado.`,

            tipo:
              "atencao",
          });

      }

      // BAIXO VIGOR

      if (
        Number(
          projeto.baixo_vigor
        ) > 20
      ) {

        await supabase
          .from("notificacoes")
          .upsert({
            chave:
              `baixo_vigor_${projeto.id}`,

            fazenda_id:
              fazenda.id,

            titulo:
              "Baixo vigor crítico",

            descricao:
              `${projeto.baixo_vigor}% da área apresenta baixo vigor.`,

            tipo:
              "critico",
          });

      }

      // CONFIANÇA BAIXA

      if (
        projeto.nivel_confianca &&
        projeto.nivel_confianca < 70
      ) {

        await supabase
          .from("notificacoes")
          .upsert({
            chave:
              `confianca_baixa_${projeto.id}`,

            fazenda_id:
              fazenda.id,

            titulo:
              "Confiança baixa",

            descricao:
              `A análise apresentou apenas ${projeto.nivel_confianca}% de confiança.`,

            tipo:
              "atencao",
          });

      }
    }

    return NextResponse.json({
      sucesso: true,
    });

  } catch (error: any) {

    return NextResponse.json(
      {
        erro: error.message,
      },
      {
        status: 500,
      }
    );

  }
}