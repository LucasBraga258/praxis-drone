import Link from "next/link";
import PageHeader from "@/app/components/ui/PageHeader";
import {
  listarMissoes,
  Missao,
} from "../../../lib/services/projetos";
import MissionCard from "./components/MissionCard";

export default async function ProjetosPage() {
  const projetos = await listarMissoes();

  return (
    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <PageHeader
        title="Missões"
        subtitle="Gerencie todas as missões cadastradas."

        actions={
          <Link
            href="/dashboard/projetos/novo"
            className="
              bg-green-600
              hover:bg-green-700
              px-6
              py-3
              rounded-xl
              font-semibold
              transition
            "
          >
            + Nova Missão
          </Link>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6">

    {projetos.map((projeto) => (

        <MissionCard
            key={projeto.id}
            projeto={projeto}
        />

    ))}

</div>

    </main>
  );
}