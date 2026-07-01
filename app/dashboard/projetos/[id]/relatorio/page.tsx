"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RelatorioPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const projetoId = params.id as string;

  const [projeto, setProjeto] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarProjeto() {
      const { data } = await supabase
        .from("projetos")
        .select(`*, fazendas (nome)`)
        .eq("id", projetoId)
        .single();
        
      setProjeto(data);
      setCarregando(false);
    }
    carregarProjeto();
  }, [projetoId]);

  if (carregando) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
      </main>
    );
  }

  if (!projeto) {
    return (
      <main className="min-h-screen bg-slate-100 p-10 flex items-center justify-center flex-col gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Projeto não encontrado</h1>
        <button onClick={() => router.back()} className="bg-slate-800 text-white px-6 py-2 rounded-lg">Voltar</button>
      </main>
    );
  }

  return (
    <main className="bg-slate-100 min-h-screen py-10 print:bg-white print:py-0">
      
      {/* Botões Flutuantes (Ocultos na Impressão) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden px-4">
        <button 
          onClick={() => router.back()}
          className="bg-slate-300 hover:bg-slate-400 text-slate-700 px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          &larr; Voltar
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-colors flex items-center gap-2"
        >
          🖨️ Imprimir / Salvar PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-12 print:shadow-none print:p-0 print:max-w-none">

        {/* CAPA */}
        <div className="text-center border-b-2 border-slate-200 pb-10 mb-10">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="bg-emerald-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl">
              P
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-800">Praxis Drone</h2>
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Relatório Técnico Agronômico
          </h1>
          <p className="text-xl text-slate-500 uppercase tracking-widest font-semibold">
            Agricultura de Precisão
          </p>
        </div>

        {/* DADOS DO PROJETO */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-10 print:border-none print:bg-white">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wide">
            Informações da Missão
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm text-slate-700">
            <div>
              <p className="text-slate-400 uppercase text-xs font-semibold">Código do Projeto</p>
              <p className="font-bold text-slate-800 text-base">{projeto.codigo}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-xs font-semibold">Fazenda</p>
              <p className="font-bold text-slate-800 text-base">{projeto.fazendas?.nome || "-"}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-xs font-semibold">Data do Voo</p>
              <p className="font-bold text-slate-800 text-base">{projeto.data_voo || "-"}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-xs font-semibold">Área Mapeada</p>
              <p className="font-bold text-slate-800 text-base">{projeto.area_mapeada} ha</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-xs font-semibold">Cultura</p>
              <p className="font-bold text-slate-800 text-base">{projeto.cultura || "-"}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-xs font-semibold">Status do Processamento</p>
              <p className="font-bold text-slate-800 text-base">{projeto.status}</p>
            </div>
          </div>
        </div>

        {/* INDICADORES */}
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide">
          Indicadores de Vigor Vegetativo
        </h2>
        <div className="grid grid-cols-4 gap-4 mb-10 text-center">
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <p className="text-xs uppercase font-bold text-emerald-600 mb-1">Alto Vigor</p>
            <h2 className="text-3xl font-black text-emerald-700">{projeto.alto_vigor || 0}%</h2>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
            <p className="text-xs uppercase font-bold text-yellow-600 mb-1">Médio Vigor</p>
            <h2 className="text-3xl font-black text-yellow-700">{projeto.medio_vigor || 0}%</h2>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <p className="text-xs uppercase font-bold text-red-600 mb-1">Baixo Vigor</p>
            <h2 className="text-3xl font-black text-red-700">{projeto.baixo_vigor || 0}%</h2>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <p className="text-xs uppercase font-bold text-indigo-600 mb-1">Confiabilidade</p>
            <h2 className="text-3xl font-black text-indigo-700">{projeto.nivel_confianca || 85}%</h2>
          </div>
        </div>

        {/* IMAGENS - Page Break before this section for clean printing */}
        <div className="mb-10 print:break-before-page">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide">
            Registro Fotográfico e Cartográfico
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex flex-col">
              <h3 className="font-bold text-slate-700 mb-3 text-center">Ortomosaico (RGB)</h3>
              <div className="bg-slate-100 border border-slate-300 rounded-xl flex-1 flex items-center justify-center min-h-[250px] overflow-hidden">
                {projeto.ortomosaico_img_url ? (
                  <img src={projeto.ortomosaico_img_url} alt="Ortomosaico" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400">Imagem indisponível</span>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-slate-700 mb-3 text-center">Índice de Vegetação (NDVI/VARI)</h3>
              <div className="bg-slate-100 border border-slate-300 rounded-xl flex-1 flex items-center justify-center min-h-[250px] overflow-hidden">
                {projeto.ndvi_img_url ? (
                  <img src={projeto.ndvi_img_url} alt="NDVI" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400">Imagem indisponível</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RELATÓRIO IA / ANÁLISE TÉCNICA */}
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-6 uppercase tracking-wide">
          Análise Técnica e Diagnóstico
        </h2>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 print:border-none print:bg-white text-slate-800 leading-relaxed">
          {projeto.relatorio_html ? (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: projeto.relatorio_html }} />
          ) : (
            <div className="space-y-4">
              <p>A análise técnica preliminar indica que <strong>{projeto.alto_vigor || 0}%</strong> da área mapeada encontra-se com alto vigor vegetativo.</p>
              <p>As áreas de baixo vigor representam <strong>{projeto.baixo_vigor || 0}%</strong> da área e estão possivelmente sofrendo com estresse hídrico, deficiência nutricional ou ataque de pragas.</p>
              <p>Recomenda-se realizar monitoramento in-loco (Scouting) nas manchas vermelhas indicadas no mapa de Índice de Vegetação (NDVI) para determinar as causas da anomalia.</p>
              <p className="mt-6"><strong>Recomendações da IA Praxis:</strong></p>
              <ul className="list-disc pl-5">
                <li>Agendar visita de campo nos talhões com menor índice.</li>
                <li>Verificar registros pluviométricos dos últimos 15 dias.</li>
                <li>Analisar perfil do solo nas áreas de compactação suspeita.</li>
              </ul>
            </div>
          )}
        </div>

        {/* RODAPÉ DO DOCUMENTO */}
        <div className="mt-16 pt-8 border-t-2 border-slate-200 flex justify-between items-center text-sm text-slate-500 font-medium">
          <p>Gerado automaticamente por Praxis Drone AI</p>
          <p>Página 1 de 1</p>
        </div>

      </div>
    </main>
  );
}