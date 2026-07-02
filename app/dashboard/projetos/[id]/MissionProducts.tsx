import Card from "@/app/components/ui/Card";

interface MissionProductsProps {
  ortomosaicoUrl: string | null;
  ndviUrl: string | null;
  webgisUrl: string | null;
  pdfUrl: string | null;
  ortomosaicoImgUrl: string | null;
  ndviImgUrl: string | null;
  elevacaoImgUrl: string | null;
  dsmImgUrl?: string | null;
  dtmImgUrl?: string | null;
  fonte_captura?: string;
  relatorioIa?: string | null;
}

interface ProductCardProps {
  nome: string;
  descricao: string;
  url: string | null;
  icone: string;
  projetoId?: number;
}

function ProductCard({ nome, descricao, url, icone, projetoId }: ProductCardProps) {
  const disponivel = !!url;

  return (
    <div
      className={`
        bg-[#0F1C30] rounded-xl p-5 border transition-all duration-200
        ${disponivel
          ? "border-slate-700 hover:border-emerald-600 cursor-pointer"
          : "border-slate-800 opacity-60"
        }
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icone}</span>

        <span
          className={`
            text-xs font-medium px-2 py-1 rounded-full
            ${disponivel
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-slate-700/50 text-slate-500"
            }
          `}
        >
          {disponivel ? "Disponível" : "Pendente"}
        </span>
      </div>

      <h3 className="text-white font-semibold">{nome}</h3>
      <p className="text-slate-500 text-sm mt-1">{descricao}</p>

      {disponivel && (
        <a
          href={(url!.includes("{z}") || url!.includes("%7Bz%7D")) ? `/dashboard/projetos/${projetoId || window.location.pathname.split("/").pop()}/mapa` : url!.replace("stac.cogeo.org", "titiler.xyz/stac")}
          target={(url!.includes("{z}") || url!.includes("%7Bz%7D")) ? "_self" : "_blank"}
          rel="noopener noreferrer"
          className="
            inline-flex items-center gap-2
            text-sm text-emerald-400 font-medium
            mt-4 hover:text-emerald-300 transition-colors
          "
        >
          Visualizar
          <span className="text-xs">→</span>
        </a>
      )}
    </div>
  );
}

export default function MissionProducts({
  projetoId,
  camera,
  ortomosaicoUrl,
  ndviUrl,
  webgisUrl,
  pdfUrl,
  ortomosaicoImgUrl,
  ndviImgUrl,
  elevacaoImgUrl,
  dsmImgUrl,
  dtmImgUrl,
  relatorioIa,
  ...props
}: MissionProductsProps & { projetoId: number, camera?: string }) {

  const isRGB = camera?.toUpperCase().includes("RGB") && !camera?.toUpperCase().includes("MULTISPECTRAL");
  const isDrone = props.fonte_captura === "Drone";

  const produtos: ProductCardProps[] = [
    {
      nome: "Ortomosaico",
      descricao: "Mosaico georreferenciado em alta resolução",
      url: ortomosaicoUrl || ortomosaicoImgUrl,
      icone: "🗺️",
    },
    {
      nome: isRGB ? "Vigor Vegetativo (VARI)" : "Índice de Área Foliar (NDVI)",
      descricao: isRGB ? "Índice de saúde das plantas a partir de espectro visível" : "Índice de vegetação por diferença normalizada",
      url: ndviUrl || ndviImgUrl,
      icone: "🌿",
    },
    ...(isDrone ? [
      {
        nome: "Superfície (DSM)",
        descricao: "Modelo topográfico da superfície e alvos",
        url: elevacaoImgUrl || dsmImgUrl || null,
        icone: "⛰️",
      },
      {
        nome: "Terreno (DTM)",
        descricao: "Modelo numérico de elevação do solo",
        url: dtmImgUrl || null,
        icone: "🕳️",
      }
    ] : []),
    {
      nome: "WebGIS",
      descricao: "Visualização interativa com camadas",
      url: `/dashboard/projetos/${projetoId}/mapa`,
      icone: "🌐",
    },
    {
      nome: "Relatório PDF",
      descricao: "Relatório técnico completo da missão",
      url: pdfUrl || (relatorioIa ? `/dashboard/projetos/${projetoId}/relatorio` : null),
      icone: "📄",
    },
  ];

  const disponiveis = produtos.filter((p) => p.url).length;

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Produtos Gerados</h2>

        <span className="text-xs text-slate-500 bg-[#0F1C30] px-3 py-1 rounded-full">
          {disponiveis}/{produtos.length} disponíveis
        </span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {produtos.map((produto) => (
          <ProductCard key={produto.nome} {...produto} projetoId={projetoId} />
        ))}
      </div>
    </Card>
  );
}
