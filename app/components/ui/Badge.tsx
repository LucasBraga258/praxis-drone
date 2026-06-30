interface BadgeProps {
  children: React.ReactNode;
  color?: "green" | "yellow" | "red" | "gray";
}

export default function Badge({
  children,
  color = "gray",
}: BadgeProps) {

  const colors = {
    green: "bg-green-600",
    yellow: "bg-yellow-500 text-black",
    red: "bg-red-600",
    gray: "bg-slate-600",
  };

  return (
    <span
      className={`
        ${colors[color]}
        px-3
        py-1
        rounded-full
        text-sm
        font-semibold
      `}
    >
      {children}
    </span>
  );
}