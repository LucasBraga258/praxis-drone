import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { texto } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
Extraia as informações abaixo do texto.

Retorne APENAS JSON.

Campos:

{
  "cultura":"",
  "municipio":"",
  "uf":"",
  "gsd":"",
  "latitude":"",
  "longitude":""
}

Texto:

${texto}
      `,
    });

    return NextResponse.json({
      resultado: response.text,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { erro: "Falha na análise" },
      { status: 500 }
    );
  }
}