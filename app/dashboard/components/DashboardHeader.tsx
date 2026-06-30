interface DashboardHeaderProps {
  empresa?: string;
}

export default function DashboardHeader({
  empresa = "Praxis Agricultura de Precisão",
}: DashboardHeaderProps) {
  const hora = new Date().getHours();

  let saudacao = "Boa noite";

  if (hora < 12) {
    saudacao = "Bom dia";
  } else if (hora < 18) {
    saudacao = "Boa tarde";
  }

  return (
    <div className="mb-10">

      <p className="text-green-400 font-medium">
        {saudacao}, Lucas 👋
      </p>

      <h1 className="text-4xl font-bold mt-2">
        Dashboard
      </h1>

      <p className="text-slate-400 mt-2">
        {empresa}
      </p>

    </div>
  );
}