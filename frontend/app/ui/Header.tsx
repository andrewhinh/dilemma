import React, { ReactNode } from "react";

interface HeaderProps {
  header?: string;
  children: ReactNode;
  className?: string;
}

function Header({ children, className }: HeaderProps) {
  const defaultClassName =
    "flex flex-col text-cyan-500" +
    (className ? "" : " gap-4 items-center justify-center") +
    (!className || !className.includes("gap") ? " gap-4" : "") +
    (!className || !className.includes("items") ? " items-center" : "") +
    (!className || !className.includes("justify") ? " justify-center" : "");

  return (
    <header
      className={
        className ? `${className} ${defaultClassName}` : defaultClassName
      }
    >
      {children}
    </header>
  );
}

export default Header;
