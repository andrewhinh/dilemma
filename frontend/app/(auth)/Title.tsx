"use client";

import { usePathname } from "next/navigation";
import Header from "../ui/Header";

function Title() {
  const pathname = usePathname();
  const route = pathname.split("/")[1];

  return (
    <>
      {route === "login" && (
        <Header>
          <h1 className="p-2 text-4xl md:text-6xl">Login</h1>
        </Header>
      )}
      {route === "signup" && (
        <Header>
          <h1 className="p-2 text-4xl md:text-6xl whitespace-nowrap">
            Sign Up
          </h1>
        </Header>
      )}
      {route === "reset-password" && (
        <Header>
          <h1 className="p-2 text-4xl md:text-6xl">Reset Password</h1>
        </Header>
      )}
    </>
  );
}

export default Title;
