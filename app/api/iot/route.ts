import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { talhaoId, valor, dataLeitura, observacao } = body;

    if (!talhaoId || valor === undefined || !dataLeitura) {
      return NextResponse.json({ error: "Parâmetros obrigatórios ausentes" }, { status: 400 });
    }

    const { data, error } = await supabase.from("dados_iot").insert({
      talhao_id: talhaoId,
      device_id: "MANUAL",
      tipo_sensor: "PLUVIOMETRO_MANUAL",
      valor: Number(valor),
      unidade: "mm",
      data_leitura: new Date(dataLeitura).toISOString(),
      metadata: observacao ? { observacao } : {}
    }).select().single();

    if (error) {
      console.error("[POST /api/iot]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("[POST /api/iot]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
