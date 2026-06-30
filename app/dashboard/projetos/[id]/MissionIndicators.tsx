import Card from "@/app/components/ui/Card";

interface MissionIndicatorsProps {
  altoVigor: number;
  medioVigor: number;
  baixoVigor: number;
}

function IndicadorVigor({
  label,
  valor,
  cor,
  corBarra,
}: {
  label: string;
  valor: number;
  cor: string;
  corBarra: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400 font-medium">{label}</span>
        <span className={`text-2xl font-bold ${cor}`}>{valor}%</span>
      </div>

      <div className="w-full h-2.5 rounded-full bg-[#0F1C30] overflow-hidden">
        <div
          className={`${corBarra} h-2.5 rounded-full transition-all duration-700`}
          style={{ width: `${valor}%` }}
        />
      </div>
    </div>
  );
}

export default function MissionIndicators({
  altoVigor,
  medioVigor,
  baixoVigor,
}: MissionIndicatorsProps) {
  const total = altoVigor + medioVigor + baixoVigor;
  const hasData = total > 0;

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Indicadores Agronômicos
        </h2>

        {hasData && (
          <span className="text-xs text-slate-500 bg-[#0F1C30] px-3 py-1 rounded-full">
            NDVI Classificado
          </span>
        )}
      </div>

      {hasData ? (
        <div className="space-y-5">
          <IndicadorVigor
            label="Alto Vigor"
            valor={altoVigor}
            cor="text-emerald-400"
            corBarra="bg-emerald-500"
          />

          <IndicadorVigor
            label="Médio Vigor"
            valor={medioVigor}
            cor="text-amber-400"
            corBarra="bg-amber-500"
          />

          <IndicadorVigor
            label="Baixo Vigor"
            valor={baixoVigor}
            cor="text-red-400"
            corBarra="bg-red-500"
          />
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-500 text-sm">
            Indicadores disponíveis após o processamento NDVI.
          </p>
        </div>
      )}
    </Card>
  );
}
