import React, { ReactNode } from "react";

interface FormProps {
  form?: string;
  onSubmit: (e: any) => void;
  children: ReactNode;
  className?: string;
}

function Form({ onSubmit, children, className }: FormProps) {
  const defaultClassName =
    "gap-8 flex flex-col text-center items-center justify-center";

  return (
    <form
      onSubmit={onSubmit}
      className={
        className ? `${className} ${defaultClassName}` : defaultClassName
      }
    >
      {children}
    </form>
  );
}

export default Form;
