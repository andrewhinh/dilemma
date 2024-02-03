"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { useGetUser } from "../utils";
import { useConst } from "../providers";
import { useRefreshToken, useLogOut } from "../lib/callbacks";

import { Button } from "./Button";
import homeURL from "@/public/opengraph-image.jpg";
import profileOutline from "@/public/profile-outline.svg";
import buttonLoading from "@/public/button-loading.svg";

function Nav({ children }: { children: ReactNode }) {
  return (
    <nav className="p-4 bg-cyan-200 text-zinc-500 flex">
      <div className="flex flex-1 justify-start md:pl-2">
        <Link
          href="/"
          className="relative w-10 h-10 hover:opacity-50 transition ease-in-out duration-300"
        >
          <Image src={homeURL} alt="Home Link" className="object-contain" />
        </Link>
      </div>
      {children}
    </nav>
  );
}

function LoggedOutNav({ showLogin = true, showSignUp = true }) {
  const router = useRouter();

  return (
    <Nav>
      <div className="gap-2 md:gap-4 md:pr-2 justify-end flex flex-1 items-center">
        {showLogin && (
          <Button
            onClick={() => {
              router.push("/login");
            }}
            className="md:w-28 p-2"
          >
            <p>Login</p>
          </Button>
        )}
        {showSignUp && (
          <Button
            onClick={() => {
              router.push("/signup");
            }}
            className="md:w-28 p-2 whitespace-nowrap"
          >
            <p>Sign Up</p>
          </Button>
        )}
      </div>
    </Nav>
  );
}

function LoggedInNav() {
  const router = useRouter();
  const getUser = useGetUser();
  const { state, dispatch } = useConst();
  const { getUserInfo, profilePicture, uid } = state;
  const logOut = useLogOut();

  const [showDropdown, setShowDropdown] = useState(false);
  const [logOutLoading, setLogOutLoading] = useState(false);

  useEffect(() => {
    if (getUserInfo) {
      getUser();
      dispatch({ type: "SET_GET_USER_INFO", payload: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getUserInfo]);

  return (
    <Nav>
      <div
        onMouseLeave={() => setShowDropdown(false)}
        className="relative flex flex-1 justify-end md:pr-2"
      >
        <div
          onMouseEnter={() => {
            setShowDropdown(!showDropdown);
          }}
        >
          <Image
            src={profilePicture || profileOutline}
            alt="Account Link"
            width={40}
            height={40}
            className="rounded-full object-contain"
          />
        </div>
        {showDropdown && (
          <div
            className="absolute z-10 right-0 bg-slate-300 rounded-lg shadow-xl gap-1 p-2 flex flex-col"
            style={{ top: "100%" }} // Directly at the bottom of the button
          >
            <Button
              className="p-3 whitespace-nowrap"
              onClick={() => {
                router.push("/account/" + uid);
              }}
            >
              My Account
            </Button>
            <Button
              className="p-3 bg-rose-500 whitespace-nowrap"
              onClick={() => {
                setLogOutLoading(true);
                logOut();
              }}
            >
              {logOutLoading ? (
                <Image
                  src={buttonLoading}
                  alt="Loading"
                  width={24} // Tailwind w-6 equivalent
                  height={24} // Tailwind h-6 equivalent
                />
              ) : (
                "Log Out"
              )}
            </Button>
          </div>
        )}
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
    else router.push("/account/" + uid);
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

  const { isLoggedIn } = state;

  useEffect(() => {
    if (!isLoggedIn) refreshToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return isLoggedIn ? <LoggedInNav /> : <LoggedOutNav />;
}

export { LoggedOutNav, LoggedInNav, AuthNav, MainNav };
