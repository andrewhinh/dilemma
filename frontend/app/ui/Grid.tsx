import React, { ReactNode, CSSProperties } from "react";

interface GridProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function Grid({ children, className, style }: GridProps) {
  const defaultClassName =
    "grid grid-cols-auto-fit-min-15 md:grid-cols-auto-fit-min-20 gap-4 justify-items-center items-center";
  return (
    <ul
      className={
        className ? `${className} ${defaultClassName}` : defaultClassName
      }
      style={style}
    >
      {children}
    </ul>
  );
}

export default Grid;
