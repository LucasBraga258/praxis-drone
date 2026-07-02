import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { talhaoId, dias = 15 } = body;

    if (!talhaoId) {
      return NextResponse.json({ error: "talhaoId is required" }, { status: 400 });
    }

    // Gerar dados de chuva simulados para os últimos X dias
    const mockData = [];
    const now = new Date();

    // Uma chance de 30% de chuva por dia, gerando de 0 a 40mm
    for (let i = 0; i < dias; i++) {
      const dataLeitura = new Date(now);
      dataLeitura.setDate(dataLeitura.getDate() - i);
      
      const choveu = Math.random() > 0.7; // 30% de chance
      const valor = choveu ? Math.floor(Math.random() * 40) + 1 : 0;

      mockData.push({
        talhao_id: talhaoId,
        device_id: "MOCK_PLUV_01",
        tipo_sensor: "PLUVIOMETRO",
        valor,
        unidade: "mm",
        data_leitura: dataLeitura.toISOString(),
      });
    }

    const { error } = await supabase.from("dados_iot").insert(mockData);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${dias} dias de dados climáticos gerados.`,
      inseridos: mockData.length
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
