import React, { ReactNode } from "react";

interface MainProps {
  header?: string;
  children: ReactNode;
  className?: string;
}

function Main({ header, children, className }: MainProps) {
  const defaultClassName =
    "p-20 flex flex-col text-center items-center justify-center gap-4 min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-white flex-1";

  return (
    <main
      className={
        className ? `${defaultClassName} ${className}` : defaultClassName
      }
    >
      {header && <h1 className="text-6xl mb-16">{header}</h1>}
      {children}
    </main>
  );
}

export default Main;
