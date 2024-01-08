import React, { ReactNode } from "react";

interface MainProps {
  header?: string;
  children: ReactNode;
  className?: string;
}

function Main({ children, className }: MainProps) {
  const defaultClassName =
    "p-24 bg-zinc-50 text-zinc-500 flex flex-col flex-1 min-h-screen text-center items-center justify-center";

  return (
    <main
      className={
        className ? `${className} ${defaultClassName}` : defaultClassName
      }
    >
      {children}
    </main>
  );
}

export default Main;
