import React, { ReactNode } from "react";

interface HeaderProps {
  header?: string;
  children: ReactNode;
  className?: string;
}

function Header({ children, className }: HeaderProps) {
  const defaultClassName =
    "gap-4 flex flex-col text-center items-center justify-center";

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
