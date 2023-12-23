"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useConst } from "../../providers";
import Nav from "./Nav";
import { useRefreshToken, useLogOut } from "../lib/HelperFns";

function LoggedOutNav() {
  return (
    <Nav>
      <div className="flex flex-1 justify-end gap-4">
        <Link href="/login" className="hover:text-blue-500">
          Login
        </Link>
        <Link href="/signup" className="hover:text-blue-500">
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
      <div className="flex flex-1 justify-end gap-4">
        <Link href={"/profile/" + uid} className=" hover:text-blue-500">
          My Profile
        </Link>
        <button onClick={() => logOut()}>Log Out</button>
      </div>
    </Nav>
  ) : (
    <LoggedOutNav />
  );
}

export { LoggedOutNav, LoggedInNav };
