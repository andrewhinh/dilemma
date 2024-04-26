import { ReactNode } from "react";

function Dropdown({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`absolute bg-slate-300 rounded-lg shadow-xl gap-1 p-2 flex flex-col ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default Dropdown;
