"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useConst } from "../providers";
import { useRefreshToken, useLogOut } from "../lib/callbacks";

import { LoggedInNav } from "../ui/Nav";
import Main from "../ui/Main";
import profileLoading from "@/public/profile-loading.svg";

const Redirect = () => {
  const router = useRouter();
  const { state } = useConst();
  const refreshToken = useRefreshToken();
  const logOut = useLogOut();

  const { isLoggedIn, uid } = state;

  useEffect(() => {
    if (!isLoggedIn) {
      refreshToken().catch(() => {
        logOut("/login");
      });
    } else {
      router.push("profile/" + uid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return (
    <>
      <LoggedInNav />
      <Main className="relative z-0">
        <Image
          src={profileLoading}
          alt="Loading"
          className="w-24 md:w-48 object-contain"
        />
      </Main>
    </>
  );
};

export default Redirect;
