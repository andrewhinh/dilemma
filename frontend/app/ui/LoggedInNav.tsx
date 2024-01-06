"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useConst } from "../providers";
import Nav from "./Nav";
import { useRefreshToken, useLogOut } from "../lib/utils";

function LoggedOutNav() {
  return (
    <Nav>
      <div className="gap-4 justify-end flex flex-1">
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
