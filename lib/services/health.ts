import { supabase } from "../../lib/supabase";

/**
 * Health Check Service
 * Valida a integridade do ecossistema antes e durante a orquestração do Pipeline.
 * 
 * Uma falha nestes checks deve parar a esteira e gerar alertas de administrador.
 */

export interface SystemHealth {
  database: boolean;
  storage: boolean;
  nodeOdm: boolean;
  aiEngine: boolean;
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Tenta uma query levíssima para testar latência/acesso
    const { error } = await supabase.from('projetos').select('id').limit(1);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("[HEALTH] Database Offline:", err);
    return false;
  }
}

export async function checkStorageHealth(): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.getBucket('projetos_arquivos');
    if (error) throw error;
    return !!data;
  } catch (err) {
    console.error("[HEALTH] Storage Offline:", err);
    return false;
  }
}

export async function checkNodeODMHealth(): Promise<boolean> {
  try {
    const odmUrl = process.env.NEXT_PUBLIC_ODM_API_URL || "http://localhost:3000";
    // Tenta bater na API do NodeODM e espera resposta no endpoint de Info/Options
    const response = await fetch(`${odmUrl}/info`, { method: "GET" });
    return response.ok;
  } catch (err) {
    console.error("[HEALTH] NodeODM Offline (O worker pode estar desligado):", err);
    return false;
  }
}

export async function runFullSystemCheck(): Promise<SystemHealth> {
  const [db, storage, odm] = await Promise.all([
    checkDatabaseHealth(),
    checkStorageHealth(),
    checkNodeODMHealth()
  ]);

  return {
    database: db,
    storage: storage,
    nodeOdm: odm,
    aiEngine: true // Placeholder para a API da IA da Praxis
  };
}
