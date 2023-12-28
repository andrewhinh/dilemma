import React, { ReactNode } from "react";

interface InputProps {
  input?: string;
  id?: string;
  type?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  onChange?: (e: any) => void;
}

function Input({
  id,
  type,
  name,
  value,
  placeholder,
  autoFocus,
  className,
  onChange,
}: InputProps) {
  const defaultClassName = "text-zinc-500 bg-slate-300 p-2";

  return (
    <input
      id={id}
      type={type}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      autoFocus={autoFocus}
      className={
        className ? `${className} ${defaultClassName}` : defaultClassName
      }
    />
  );
}

export default Input;
