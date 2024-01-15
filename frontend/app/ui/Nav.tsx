/* eslint-disable @next/next/no-img-element */
"use client";

import React, { ReactNode, useEffect } from "react";
import Link from "next/link";

import { useConst } from "../providers";
import { useRefreshToken, useLogOut } from "../lib/utils";

import homeURL from "@/public/opengraph-image.jpg";

function Nav({ children }: { children: ReactNode }) {
  return (
    <nav className="p-4 bg-cyan-200 text-zinc-500 flex">
      <div className="flex flex-1 justify-start">
        <Link href="/">
          <img
            src={homeURL.src}
            alt="Home Link"
            className="object-contain h-6 hover:opacity-50 transition 300ms ease-in-out"
          />
        </Link>
      </div>
      {children}
    </nav>
  );
}

function LoggedOutNav({ showLogin = true, showSignUp = true }) {
  return (
    <Nav>
      <div className="gap-4 justify-end flex flex-1">
        {showLogin && (
          <Link
            href="/login"
            className="hover:opacity-50 transition 300ms ease-in-out"
          >
            Login
          </Link>
        )}
        {showSignUp && (
          <Link
            href="/signup"
            className="hover:opacity-50 transition 300ms ease-in-out"
          >
            Sign Up
          </Link>
        )}
      </div>
    </Nav>
  );
}

function LoggedInNav() {
  const { token, uid } = useConst();
  const refreshToken = useRefreshToken();
  const logOut = useLogOut();

  useEffect(() => {
    if (!token) refreshToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return token ? (
    <Nav>
      <div className="gap-4 justify-end flex flex-1">
        <Link
          href={"/profile/" + uid}
          className="hover:opacity-50 whitespace-nowrap"
        >
          My Profile
        </Link>
        <button
          className="hover:opacity-50 whitespace-nowrap"
          onClick={() => logOut()}
        >
          Log Out
        </button>
      </div>
    </Nav>
  ) : (
    <LoggedOutNav />
  );
}

export { LoggedOutNav, LoggedInNav };
