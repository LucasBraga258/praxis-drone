"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import { toast } from "sonner";
// import { runFullSystemCheck } from "@/lib/services/health"; -> cannot run directly in client, will use API or simple state

interface LogRow {
  id: number;
  job_id: string;
  acao: string;
  status: string;
  mensagem: string;
  duracao_ms: number;
  criado_em: string;
}

interface JobRow {
  id: string;
  projeto_id: number;
  status: string;
  etapa_atual: string;
  started_at: string;
}

export default function AdminDashboardPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [health, setHealth] = useState({ db: true, storage: true, odm: true });

  const fetchData = async () => {
    // Busca Logs
    const { data: logData } = await supabase
      .from("process_logs")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(20);
    if (logData) setLogs(logData);

    // Busca Fila (Jobs)
    const { data: jobData } = await supabase
      .from("mission_jobs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(10);
    if (jobData) setJobs(jobData);
    
    // Ping simples do NodeODM no client
    try {
      const odmUrl = process.env.NEXT_PUBLIC_ODM_API_URL || "http://localhost:3000";
      const res = await fetch(`${odmUrl}/info`, { method: "GET" }).catch(() => null);
      setHealth(prev => ({ ...prev, odm: res?.ok || false }));
    } catch {
      setHealth(prev => ({ ...prev, odm: false }));
    }
  };

  useEffect(() => {
    fetchData();
    const int = setInterval(fetchData, 5000);
    return () => clearInterval(int);
  }, []);

  const rodarCacadorDeZumbis = async () => {
    toast.info("Iniciando varredura por zumbis...");
    try {
      const res = await fetch("/api/cron/recover");
      const json = await res.json();
      toast.success(`Varredura completa! ${json.zumbis_abatidos} jobs destravados.`);
      fetchData();
    } catch (err) {
      toast.error("Erro ao rodar script de recuperação.");
    }
  };

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            📡 Centro de Comando (Admin)
          </h1>
          <p className="text-slate-400 mt-1">
            Monitoramento de Fila, Logs de Orquestração e Saúde dos Servidores.
          </p>
        </div>
        <button 
          onClick={rodarCacadorDeZumbis}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-bold transition flex items-center gap-2"
        >
          🧹 Forçar Limpeza de Fila (Zumbis)
        </button>
      </div>

      {/* SEMAFARES DE SAÚDE */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${health.db ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <div>
            <h3 className="text-lg font-bold text-slate-200">Supabase DB</h3>
            <p className="text-xs text-slate-400">{health.db ? 'Online & Operacional' : 'FALHA DE CONEXÃO'}</p>
          </div>
        </Card>
        
        <Card className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${health.storage ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <div>
            <h3 className="text-lg font-bold text-slate-200">Storage Nuvem</h3>
            <p className="text-xs text-slate-400">{health.storage ? 'Online & Operacional' : 'FALHA DE BUCKET'}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border-l-2 border-indigo-500">
          <div className={`w-4 h-4 rounded-full ${health.odm ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <div>
            <h3 className="text-lg font-bold text-slate-200">Worker NodeODM</h3>
            <p className="text-xs text-slate-400">{health.odm ? 'Renderizador Pronto' : 'OFFLINE / PORTA 3000 OCUPADA'}</p>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* FILA DE PROCESSAMENTO */}
        <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-400">
            ⏳ Fila de Orquestração Global
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0F1C30] text-slate-400">
                <tr>
                  <th className="p-3 rounded-tl-lg">Missão (ID)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Etapa Atual</th>
                  <th className="p-3 rounded-tr-lg">Início</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[#0E1A2D]">
                    <td className="p-3">#{job.projeto_id}</td>
                    <td className="p-3">
                      <Badge color={
                        job.status === "RUNNING" ? "green" : 
                        job.status === "QUEUED" ? "yellow" : 
                        job.status === "FAILED" ? "red" : "gray"
                      }>
                        {job.status}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono text-xs">{job.etapa_atual}</td>
                    <td className="p-3 text-slate-500">{new Date(job.started_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500">A esteira está totalmente limpa. Nenhuma missão na fila.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* LOGS DE AUDITORIA */}
        <Card>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-300">
            📜 Auditoria e Retries (Logs)
          </h2>
          <div className="space-y-3 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {logs.map((log) => (
              <div key={log.id} className="bg-[#0A1424] p-3 rounded-lg border border-slate-800 text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-bold ${
                    log.status === 'ERROR' ? 'text-red-400' :
                    log.status === 'WARN' ? 'text-yellow-400' :
                    log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-blue-400'
                  }`}>
                    [{log.status}] {log.acao}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(log.criado_em).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-300">{log.mensagem}</p>
                {log.duracao_ms > 0 && (
                  <span className="text-xs text-slate-600 mt-2 block">Duração: {log.duracao_ms}ms</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
