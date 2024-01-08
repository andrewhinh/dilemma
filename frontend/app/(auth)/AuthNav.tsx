"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConst } from "../providers";
import { usePathname } from "next/navigation";
import { useRefreshToken } from "../lib/utils";

import { LoggedOutNav } from "../ui/Nav";

function AuthNav() {
  const { token, uid } = useConst();
  const router = useRouter();
  const refreshToken = useRefreshToken();
  const pathname = usePathname();
  const route = pathname.split("/")[1];

  useEffect(() => {
    if (!token) refreshToken();
    else router.push("profile/" + uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <>
      {route === "login" && <LoggedOutNav showLogin={false} />}
      {route === "signup" && <LoggedOutNav showSignUp={false} />}
      {route === "reset-password" && <LoggedOutNav />}
    </>
  );
}

export default AuthNav;
