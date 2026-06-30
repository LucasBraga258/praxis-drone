import Card from "@/app/components/ui/Card";

interface Intervencao {
  id: number | string;
  data_intervencao?: string | null;
  praga?: string | null;
  produto?: string | null;
  dose?: string | null;
  responsavel?: string | null;
}

interface MissionInterventionsProps {
  intervencoes: Intervencao[];
}

function InterventionItem({ item }: { item: Intervencao }) {
  return (
    <div className="bg-[#0F1C30] rounded-xl p-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
          Data
        </p>
        <p className="text-sm text-white font-medium">
          {item.data_intervencao
            ? new Date(item.data_intervencao).toLocaleDateString("pt-BR")
            : "—"}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
          Praga
        </p>
        <p className="text-sm text-white font-medium">
          {item.praga || "—"}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
          Produto
        </p>
        <p className="text-sm text-white font-medium">
          {item.produto || "—"}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
          Dose
        </p>
        <p className="text-sm text-white font-medium">
          {item.dose || "—"}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
          Responsável
        </p>
        <p className="text-sm text-white font-medium">
          {item.responsavel || "—"}
        </p>
      </div>
    </div>
  );
}

export default function MissionInterventions({
  intervencoes,
}: MissionInterventionsProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Intervenções Relacionadas
        </h2>

        {intervencoes.length > 0 && (
          <span className="text-xs text-slate-500 bg-[#0F1C30] px-3 py-1 rounded-full">
            {intervencoes.length} registro{intervencoes.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {intervencoes.length > 0 ? (
        <div className="space-y-3">
          {intervencoes.map((item) => (
            <InterventionItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-500 text-sm">
            Nenhuma intervenção registrada para esta missão.
          </p>
        </div>
      )}
    </Card>
  );
}
