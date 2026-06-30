import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  href?: string;
  subtitle?: string;
  color?: string;
}

function CardContent({
  title,
  value,
  icon,
  subtitle,
  color = "text-white",
}: Omit<StatCardProps, "href">) {
  return (
    <>
      <div className="flex items-center justify-between">

        <p className="text-slate-400 font-medium">
          {title}
        </p>

        <span className="text-3xl">
          {icon}
        </span>

      </div>

      <h2 className={`text-4xl font-bold mt-4 ${color}`}>
        {value}
      </h2>

      {subtitle && (
        <p className="text-sm text-slate-500 mt-2">
          {subtitle}
        </p>
      )}
    </>
  );
}

export default function StatCard(props: StatCardProps) {

  const classe = `
    bg-[#16253D]
    border
    border-slate-700
    rounded-2xl
    p-6
    transition
    hover:border-green-500
    hover:-translate-y-1
    duration-200
  `;

  if (props.href) {
    return (
      <Link
        href={props.href}
        className={classe}
      >
        <CardContent {...props} />
      </Link>
    );
  }

  return (
    <div className={classe}>
      <CardContent {...props} />
    </div>
  );
}