import React, { ReactNode, CSSProperties } from "react";

interface GridProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function Grid({ children, className, style }: GridProps) {
  const defaultClassName =
    "gap-4 grid justify-items-center items-center";
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
