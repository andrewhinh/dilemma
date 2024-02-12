import React, { ReactNode } from "react";

interface ButtonProps {
  button?: string;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  noHover?: boolean;
  className?: string;
  onClick?: (e: any) => void;
}

function Button({ children, type, className, onClick, noHover }: ButtonProps) {
  let classNames = [
    "bg-cyan-500 text-zinc-50 font-semibold rounded flex justify-center items-center",
  ];

  if (noHover === false) {
    classNames.push("cursor-not-allowed opacity-50");
    onClick = undefined;
  } else {
    // covers cases where noHover is undefined or true
    classNames.push(
      "hover:opacity-50 hover:shadow-2xl transition 300ms ease-in-out"
    );
  }

  if (className) classNames.push(className);

  return (
    <button type={type} onClick={onClick} className={classNames.join(" ")}>
      {children}
    </button>
  );
}

function FormButton({ children, className, onClick, noHover }: ButtonProps) {
  let classNames = ["w-full h-10 px-4 py-2"];
  if (className) classNames.push(className);

  return (
    <Button
      type="submit"
      onClick={onClick}
      className={classNames.join(" ")}
      noHover={noHover}
    >
      {children}
    </Button>
  );
}

export { Button, FormButton };
