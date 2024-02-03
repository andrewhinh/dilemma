import React, { ReactNode } from "react";

interface MainProps {
  header?: string;
  children: ReactNode;
  className?: string;
}

function Main({ children, className }: MainProps) {
  const defaultClassName =
    "p-24 h-full flex-1 flex flex-col text-center items-center justify-center";

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
