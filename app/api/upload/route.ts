import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest
) {

  try {

    const formData =
      await request.formData();

    const projetoId =
      Number(
        formData.get("projetoId")
      );

    const arquivos =
      formData.getAll("files");

    return NextResponse.json({

      sucesso: true,

      projetoId,

      quantidade:
        arquivos.length,

    });

  }

  catch (e) {

    return NextResponse.json(

      {

        sucesso:false,

      },

      {

        status:500,

      }

    );

  }

}