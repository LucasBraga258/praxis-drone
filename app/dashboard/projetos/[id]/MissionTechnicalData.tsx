import Card from "@/app/components/ui/Card";

interface MissionTechnicalDataProps {
  cultura: string | null;
  municipio: string | null;
  uf: string | null;
  gsd: number | null;
  latitude: number | null;
  longitude: number | null;
  elevacaoMin: number | null;
  elevacaoMax: number | null;
  piloto: string | null;
  drone: string | null;
  camera: string | null;
  alturaVoo: number | null;
  sobreposicaoFrontal: number | null;
  sobreposicaoLateral: number | null;
}

function Campo({
  label,
  valor,
}: {
  label: string;
  valor: React.ReactNode;
}) {
  return (
    <div className="bg-[#0F1C30] rounded-lg p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </p>
      <p className="text-white font-medium text-sm">
        {valor ?? "—"}
      </p>
    </div>
  );
}

export default function MissionTechnicalData({
  cultura,
  municipio,
  uf,
  gsd,
  latitude,
  longitude,
  elevacaoMin,
  elevacaoMax,
  piloto,
  drone,
  camera,
  alturaVoo,
  sobreposicaoFrontal,
  sobreposicaoLateral,
}: MissionTechnicalDataProps) {
  return (
    <Card>
      <h2 className="text-xl font-bold text-white mb-6">Dados Técnicos</h2>

      <div className="space-y-6">
        {/* Dados de Voo */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Parâmetros de Voo
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Campo label="Piloto" valor={piloto} />
            <Campo label="Drone" valor={drone} />
            <Campo label="Câmera" valor={camera} />
            <Campo
              label="Altura de Voo"
              valor={alturaVoo ? `${alturaVoo} m` : null}
            />
            <Campo
              label="Sobrep. Frontal"
              valor={sobreposicaoFrontal ? `${sobreposicaoFrontal}%` : null}
            />
            <Campo
              label="Sobrep. Lateral"
              valor={sobreposicaoLateral ? `${sobreposicaoLateral}%` : null}
            />
          </div>
        </div>

        {/* Dados Geográficos */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Informações Geográficas
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Campo label="Cultura" valor={cultura} />
            <Campo
              label="Localização"
              valor={
                municipio || uf
                  ? `${municipio || "—"} / ${uf || "—"}`
                  : null
              }
            />
            <Campo
              label="GSD"
              valor={gsd ? `${gsd} cm/px` : null}
            />
            <Campo
              label="Coordenadas"
              valor={
                latitude && longitude
                  ? `${latitude}, ${longitude}`
                  : null
              }
            />
            <Campo
              label="Elevação Mín."
              valor={elevacaoMin ? `${elevacaoMin} m` : null}
            />
            <Campo
              label="Elevação Máx."
              valor={elevacaoMax ? `${elevacaoMax} m` : null}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
