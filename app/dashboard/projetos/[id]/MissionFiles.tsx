import Card from "@/app/components/ui/Card";

interface Arquivo {
  id: number;
  nome?: string;
  path?: string;
  caminho?: string;
  tipo?: string;
  tamanho?: number;
  created_at?: string;
  status?: string;
}

interface MissionFilesProps {
  arquivos: Arquivo[];
}

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export default function MissionFiles({ arquivos }: MissionFilesProps) {
  const fotos = arquivos.filter((a) => a.tipo === "foto" || a.tipo?.includes("image"));
  const tamanhoTotal = fotos.reduce(
    (acc, a) => acc + Number(a.tamanho || 0),
    0
  );

  const fotosRecentes = [...fotos]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 4);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Arquivos Enviados</h3>

        {arquivos.length > 0 && (
          <span className="text-xs text-slate-500 bg-[#0F1C30] px-3 py-1 rounded-full">
            {arquivos.length} arquivo{arquivos.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {fotos.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0F1C30] rounded-lg p-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Fotos Base</p>
              <p className="text-white font-semibold mt-1">{fotos.length}</p>
            </div>

            <div className="bg-[#0F1C30] rounded-lg p-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Tamanho Total</p>
              <p className="text-white font-semibold mt-1">
                {formatarTamanho(tamanhoTotal)}
              </p>
            </div>
          </div>
          
          {fotosRecentes.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Imagens Recentes</p>
              <div className="bg-[#0F1C30] rounded-lg p-3 space-y-2">
                {fotosRecentes.map((foto) => (
                  <div key={foto.id} className="flex justify-between items-center text-sm border-b border-slate-700/50 pb-2 last:border-0 last:pb-0">
                    <span className="text-slate-300 truncate max-w-[60%] font-mono text-xs" title={foto.nome}>
                      {foto.nome || foto.caminho?.split('/').pop() || 'Arquivo'}
                    </span>
                    <div className="flex gap-3 text-xs">
                      <span className="text-slate-500">{foto.tamanho ? formatarTamanho(foto.tamanho) : '—'}</span>
                      <span className="text-emerald-500">{foto.status || 'Disponível'}</span>
                    </div>
                  </div>
                ))}
                {fotos.length > fotosRecentes.length && (
                  <div className="text-center pt-1">
                    <span className="text-xs text-slate-500">
                      e mais {fotos.length - fotosRecentes.length} arquivos...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 bg-[#0F1C30] rounded-lg border border-slate-700/50 border-dashed">
          <p className="text-slate-400 text-sm">
            Nenhum arquivo enviado para esta missão.
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Utilize a área de upload acima.
          </p>
        </div>
      )}
    </Card>
  );
}
