"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConst } from "../providers";
import { usePathname } from "next/navigation";
import { useRefreshToken } from "../lib/utils";
import Nav from "../ui/Nav";

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
      {route === "login" && (
        <Nav>
          <div className="flex flex-1 justify-end">
            <Link
              href="/signup"
              className="hover:opacity-50 transition 300ms ease-in-out"
            >
              Sign Up
            </Link>
          </div>
        </Nav>
      )}
      {route === "signup" && (
        <Nav>
          <div className="flex flex-1 justify-end">
            <Link
              href="/login"
              className="hover:opacity-50 transition 300ms ease-in-out"
            >
              Login
            </Link>
          </div>
        </Nav>
      )}
      {route === "reset-password" && (
        <Nav>
          <div className="flex flex-1 justify-end gap-4">
            <Link
              href="/login"
              className="hover:opacity-50 transition 300ms ease-in-out"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="hover:opacity-50 transition 300ms ease-in-out"
            >
              Sign Up
            </Link>
          </div>
        </Nav>
      )}
    </>
  );
}

export default AuthNav;
