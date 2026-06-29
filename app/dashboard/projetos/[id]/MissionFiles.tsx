import React from "react";

export default function MissionFiles({ arquivos }: { arquivos: any[] }) {
  const arquivosLista = arquivos ?? [];

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm">
      <h3 className="font-semibold mb-2">Arquivos</h3>
      <p className="text-sm text-slate-500 mb-4">{arquivosLista.length} arquivos cadastrados</p>
      <ul className="text-sm space-y-2">
        {arquivosLista?.map((a: any) => (
          <li key={a?.id} className="flex justify-between">
            <span>{a?.nome || a?.path}</span>
            <span className="text-slate-400">{a?.tipo}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
