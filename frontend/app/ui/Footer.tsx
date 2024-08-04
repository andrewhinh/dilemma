import React, { ReactNode } from "react";

interface FooterProps {
  children: ReactNode;
  className?: string;
}

function Footer({ children, className }: FooterProps) {
  const defaultClassName =
    "flex flex-1 p-4 bg-slate-300 text-zinc-500 justify-center items-center";
  return (
    <footer
      className={
        className ? `${className} ${defaultClassName}` : defaultClassName
      }
    >
      {children}
    </footer>
  );
}

export default Footer;
