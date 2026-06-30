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
    await fetch("/api/analisar-imagens", {
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
      <h3 className="text-lg font-bold text-white mb-4">Ações da Missão</h3>

      <div className="flex flex-wrap gap-3">
        <ActionButton
          label="Processar Nuvem ODM"
          onClick={analisar}
          variant="primary"
        />

        <ActionButton
          label="Gerar Relatório Final"
          onClick={gerarRelatorio}
          variant="accent"
        />

        <ActionButton
          label="Diagnóstico IA Praxis"
          href={`/dashboard/projetos/${projetoId}/diagnostico`}
          variant="accent"
        />

        <ActionButton
          label="Editar Configurações"
          href={`/dashboard/projetos/${projetoId}/editar`}
          variant="secondary"
        />

        <ActionButton
          label="Ver Projeto Público"
          href={`/projetos/${projetoId}`}
          variant="secondary"
        />
      </div>
    </Card>
  );
}
