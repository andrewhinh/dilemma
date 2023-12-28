import React, { ReactNode } from "react";

interface FooterProps {
  footer?: string;
  children: ReactNode;
}

function Footer({ children }: FooterProps) {
  return (
    <footer className="p-4 bg-slate-300 text-zinc-500 flex">{children}</footer>
  );
}

export default Footer;
