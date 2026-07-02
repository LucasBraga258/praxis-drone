"use client";

import { useEffect, useState } from "react";
import Card from "@/app/components/ui/Card";
import { toast } from "sonner";

export default function ConfiguracoesPage() {
  const [aiProvider, setAiProvider] = useState<string>("Carregando...");
  const [odmStatus, setOdmStatus] = useState<string>("Verificando...");
  const [isVerificandoOdm, setIsVerificandoOdm] = useState(false);

  useEffect(() => {
    // Busca as configurações pelo backend
    async function fetchConfig() {
      try {
        const res = await fetch("/api/configuracoes");
        if (res.ok) {
          const data = await res.json();
          setAiProvider(data.aiProvider || "Não configurado");
        }
      } catch (e) {
        setAiProvider("Erro ao ler configuração");
      }
    }
    fetchConfig();
  }, []);

  const verificarOdm = async () => {
    setIsVerificandoOdm(true);
    setOdmStatus("Testando conexão...");
    try {
      const res = await fetch("/api/webodm/status");
      if (res.ok) {
        setOdmStatus("Online e Disponível");
        toast.success("NodeODM conectado com sucesso!");
      } else {
        setOdmStatus("Offline / Inacessível");
        toast.error("Falha ao comunicar com NodeODM.");
      }
    } catch (e) {
      setOdmStatus("Offline / Erro de Rede");
      toast.error("NodeODM não está rodando na porta esperada.");
    } finally {
      setIsVerificandoOdm(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-slate-100 flex items-center gap-2">
        ⚙️ Configurações do Sistema
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Inteligência Artificial */}
        <Card>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-100">Inteligência Artificial</h3>
            <p className="text-sm text-slate-400">
              Gerencie a arquitetura híbrida de IA. Escolha o motor de processamento cognitivo para suas conversas:
            </p>
            
            <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700 mt-2">
              <span className="text-xs text-slate-500 uppercase font-semibold block mb-2">Provedor Atual</span>
              <div className="flex items-center gap-3">
                <select 
                  value={aiProvider}
                  onChange={async (e) => {
                    const newVal = e.target.value;
                    setAiProvider("Salvando...");
                    await fetch("/api/configuracoes", {
                      method: "POST",
                      body: JSON.stringify({ provider: newVal })
                    });
                    setAiProvider(newVal);
                    toast.success("Provedor atualizado com sucesso!");
                  }}
                  className="bg-slate-900 border border-slate-700 text-praxis-green-400 font-bold px-3 py-2 rounded outline-none capitalize focus:border-praxis-green-500 w-full md:w-auto"
                >
                  <option value="gemini">✨ Gemini</option>
                  <option value="mock">🧠 Mock (DB Local)</option>
                  <option value="ollama">🦙 Ollama (Localhost)</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              <strong>Providers Suportados:</strong> gemini, ollama, mock.
              <br />
              Timeout de fallback ativo: 60 segundos.
            </div>
          </div>
        </Card>

        {/* Serviços de Processamento */}
        <Card>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-100">Worker NodeODM</h3>
            <p className="text-sm text-slate-400">
              Responsável pelo processamento de imagens de drone e geração de Ortomosaicos e NDVI.
            </p>

            <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700">
              <span className="text-xs text-slate-500 uppercase font-semibold">Status da Conexão</span>
              <div className={`text-lg font-bold mt-1 ${odmStatus.includes("Online") ? "text-praxis-green-400" : "text-rose-500"}`}>
                {odmStatus}
              </div>
            </div>

            <button 
              onClick={verificarOdm}
              disabled={isVerificandoOdm}
              className="mt-2 w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors disabled:opacity-50"
            >
              {isVerificandoOdm ? "Testando..." : "Testar Conexão Local"}
            </button>
          </div>
        </Card>

      </div>
    </div>
  );
}
