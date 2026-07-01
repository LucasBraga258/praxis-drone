"use client";

import Card from "@/app/components/ui/Card";

interface MissionActionsProps {
  projetoId: number;
}

interface ActionButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
  variant: "primary" | "secondary" | "accent";
}

function ActionButton({ label, href, onClick, variant }: ActionButtonProps) {
  const cores = {
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white",
    accent: "bg-indigo-600 hover:bg-indigo-700 text-white",
  };

  if (href) {
    return (
      <a
        href={href}
        className={`
          ${cores[variant]}
          px-5 py-2.5 rounded-xl font-medium text-sm
          transition-all duration-200 inline-block text-center
        `}
      >
        {label}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`
        ${cores[variant]}
        px-5 py-2.5 rounded-xl font-medium text-sm
        transition-all duration-200 cursor-pointer
      `}
    >
      {label}
    </button>
  );
}

export default function MissionActions({ projetoId }: MissionActionsProps) {
  const analisar = async () => {
    await fetch("/api/pipeline/start", {
      method: "POST",
      body: JSON.stringify({ projetoId }),
      headers: { "Content-Type": "application/json" },
    });
  };

  const gerarRelatorio = async () => {
    await fetch("/api/gerar-relatorio", {
      method: "POST",
      body: JSON.stringify({ projetoId }),
      headers: { "Content-Type": "application/json" },
    });
  };

  return (
    <Card>
      <h3 className="text-lg font-bold text-white mb-6">Ações da Missão</h3>

      <div className="space-y-6">
        
        {/* Operações */}
        <div>
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Operações (Piloto / Operador)
          </h4>
          <div className="flex flex-wrap gap-3">
            <ActionButton
              label="Processar Nuvem ODM"
              onClick={analisar}
              variant="primary"
            />
            <ActionButton
              label="Editar Configurações"
              href={`/dashboard/projetos/${projetoId}/editar`}
              variant="secondary"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Inicia a fotogrametria das imagens ou ajusta parâmetros técnicos do voo.
          </p>
        </div>

        {/* Análises */}
        <div>
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Análises Agronômicas (Agrônomo)
          </h4>
          <div className="flex flex-wrap gap-3">
            <ActionButton
              label="Diagnóstico IA Praxis"
              href={`/dashboard/projetos/${projetoId}/diagnostico`}
              variant="accent"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Analisa anomalias, calcula o vigor vegetativo e gera um laudo preliminar da IA.
          </p>
        </div>

        {/* Entregáveis */}
        <div>
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Entregáveis (Produtor / Cliente)
          </h4>
          <div className="flex flex-wrap gap-3">
            <ActionButton
              label="Gerar Relatório Final PDF"
              onClick={gerarRelatorio}
              variant="primary"
            />
            <ActionButton
              label="Acessar Link Público"
              href={`/dashboard/projetos/${projetoId}/compartilhar`}
              variant="secondary"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Gera o documento final ou gerencia o link compartilhável com o produtor rural.
          </p>
        </div>

      </div>
    </Card>
  );
}
