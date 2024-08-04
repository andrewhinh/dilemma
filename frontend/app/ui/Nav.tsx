"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { useGetUser } from "../utils";
import { useConst } from "../providers";
import { useLogOut, useAuthEffect } from "../lib/callbacks";

import Dropdown from "./Dropdown";
import { Button } from "./Button";
import homeURL from "@/public/opengraph-image.jpg";
import profileOutline from "@/public/profile-outline.svg";
import buttonLoading from "@/public/button-loading.svg";

function Nav({ children }: { children: ReactNode }) {
  const [homeLink, setHomeLink] = useState("/");

  useAuthEffect({
    onSuccess: () => {
      setHomeLink("/home");
    },
  });

  return (
    <nav className="h-20 p-4 bg-cyan-200 text-zinc-500 flex">
      <div className="flex flex-1 justify-start md:pl-2">
        <Link
          href={homeLink}
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
  const both = showLogin && showSignUp;

  return (
    <Nav>
      <div className="gap-2 md:gap-4 md:pr-2 justify-end flex flex-1 items-center">
        {showLogin && (
          <Button
            onClick={() => {
              router.push("/login");
            }}
            className={`p-2 ${both ? "max-w-28" : "max-w-20"}`}
          >
            <p>Login</p>
          </Button>
        )}
        {showSignUp && (
          <Button
            onClick={() => {
              router.push("/signup");
            }}
            className={`p-2 whitespace-nowrap ${
              both ? "max-w-28" : "max-w-20"
            }`}
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
  const { getUserInfo, profile_picture, uuid } = state;
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
            src={profile_picture || profileOutline}
            alt="Account Link"
            width={40}
            height={40}
            className="rounded-full object-contain"
          />
        </div>
        {showDropdown && (
          <Dropdown className="z-20 top-10 right-0">
            <Button
              className="p-3 whitespace-nowrap"
              onClick={() => {
                router.push("/account/" + uuid);
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
              <Image
                src={buttonLoading}
                alt="Loading"
                className={`w-6 h-6 ${logOutLoading ? "block" : "hidden"}`}
              />
              <p className={logOutLoading ? "hidden" : "block"}>Log Out</p>
            </Button>
          </Dropdown>
        )}
      </div>
    </Nav>
  );
}

function AuthNav() {
  const router = useRouter();
  const pathname = usePathname();
  const route = pathname.split("/")[1];

  useAuthEffect({
    onSuccess: () => {
      router.push("/home");
    },
  });

  return (
    <>
      {route === "login" && <LoggedOutNav showLogin={false} />}
      {route === "signup" && <LoggedOutNav showSignUp={false} />}
      {route === "reset-password" && <LoggedOutNav showLogin={false} />}
    </>
  );
}

function MainNav() {
  const { state } = useConst();
  const { isLoggedIn } = state;

  useAuthEffect({});

  return isLoggedIn ? <LoggedInNav /> : <LoggedOutNav />;
}

export { LoggedOutNav, LoggedInNav, AuthNav, MainNav };
