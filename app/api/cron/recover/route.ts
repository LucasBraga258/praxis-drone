import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { processarFila } from "@/lib/services/pipeline";
import { logProcess } from "@/lib/services/processManager";

export const dynamic = "force-dynamic";

export async function GET() {
  // Define o limite temporal: 4 horas sem alteração = Zumbi
  const quatroHorasAtras = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
  
  const { data: zumbis, error } = await supabase
    .from("mission_jobs")
    .select("id, projeto_id")
    .eq("status", "RUNNING")
    .lte("updated_at", quatroHorasAtras);
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (zumbis && zumbis.length > 0) {
    for (const zumbi of zumbis) {
      // Derruba a missão zumbi e marca como falha
      await supabase
        .from("mission_jobs")
        .update({ 
          status: "FAILED", 
          error_log: "TIMEOUT SEVERO: Job Zumbi abatido pelo Cron", 
          updated_at: new Date().toISOString() 
        })
        .eq("id", zumbi.id);
        
      await logProcess(
        zumbi.id, 
        zumbi.projeto_id.toString(), 
        "Cron de Recuperação", 
        "ERROR", 
        "Servidor capotou durante o processamento desta missão há mais de 4h. Processo abortado."
      );
    }
    
    // Libera a Fila engarrafada
    await processarFila();
  }

  return NextResponse.json({ 
    message: "Varredura completa.", 
    zumbis_abatidos: zumbis?.length || 0 
  });
}
