import React, { ReactNode } from "react";

interface ButtonProps {
  button?: string;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: (e: any) => void;
}

function Button({ children, type, className, onClick }: ButtonProps) {
  const defaultClassName =
    "h-10 bg-cyan-500 py-2 px-4 text-zinc-50 hover:opacity-50 hover:shadow-2xl transition 300ms ease-in-out font-semibold rounded flex justify-center items-center";

  return (
    <button
      type={type}
      onClick={onClick}
      className={
        className ? `${className} ${defaultClassName}` : defaultClassName
      }
    >
      {children}
    </button>
  );
}

export default Button;
