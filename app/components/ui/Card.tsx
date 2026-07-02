import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Card({
  children,
  className = "",
  style,
}: CardProps) {
  return (
    <div
      style={style}
      className={`
        bg-[#16253D]
        rounded-2xl
        p-6
        shadow-lg
        border
        border-slate-800
        ${className}
      `}
    >
      {children}
    </div>
  );
}