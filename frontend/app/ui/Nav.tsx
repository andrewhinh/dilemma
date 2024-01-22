"use client";

import React, { ReactNode, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { useConst } from "../providers";
import { useRefreshToken, useLogOut } from "../lib/callbacks";
import homeURL from "@/public/opengraph-image.jpg";

function Nav({ children }: { children: ReactNode }) {
  return (
    <nav className="p-4 bg-cyan-200 text-zinc-500 flex">
      <div className="flex flex-1 justify-start">
        <Link href="/">
          <div className="relative h-6 w-6 hover:opacity-50 transition ease-in-out duration-300">
            <Image src={homeURL} alt="Home Link" className="object-contain" />
          </div>
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
  const { state } = useConst();
  const { uid } = state;
  const logOut = useLogOut();

  return (
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
  );
}

function AuthNav() {
  const { state } = useConst();
  const router = useRouter();
  const refreshToken = useRefreshToken();
  const pathname = usePathname();
  const route = pathname.split("/")[1];

  const { isLoggedIn, uid } = state;

  useEffect(() => {
    if (!isLoggedIn) refreshToken();
    else router.push("profile/" + uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return (
    <>
      {route === "login" && <LoggedOutNav showLogin={false} />}
      {route === "signup" && <LoggedOutNav showSignUp={false} />}
      {route === "reset-password" && <LoggedOutNav />}
    </>
  );
}

function MainNav() {
  const { state } = useConst();
  const refreshToken = useRefreshToken();
  const logOut = useLogOut();

  const { isLoggedIn, uid } = state;

  useEffect(() => {
    if (!isLoggedIn) refreshToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return isLoggedIn ? (
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

export { LoggedOutNav, LoggedInNav, AuthNav, MainNav };
