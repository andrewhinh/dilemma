"use client";

import { useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useConst } from "../providers";
import { sendRequest } from "../lib/api";
import { useRefreshToken, useLogOut } from "../lib/callbacks";

import { LoggedInNav } from "../ui/Nav";
import Main from "../ui/Main";
import accountLoading from "@/public/account-loading.svg";

const Base = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, dispatch } = useConst();
  const refreshToken = useRefreshToken();
  const logOut = useLogOut();

  const { isLoggedIn, uid } = state;

  useEffect(() => {
    const authCode = searchParams.get("code");
    const authState = searchParams.get("state");

    if (authCode && authState) {
      sendRequest("/token/google", "POST", {
        code: authCode,
        state: authState,
      }).then((data) => {
        if (data.detail) {
          if (authState == "signup") {
            router.push("/signup?error=" + data.detail);
          } else {
            router.push("/login?error=" + data.detail);
          }
        } else {
          dispatch({
            type: "SET_LOGGED_IN",
            payload: true,
          });
          dispatch({
            type: "SET_UID",
            payload: data.uid,
          });
          router.push("/account/" + data.uid);
        }
      });
    } else {
      if (!isLoggedIn) {
        refreshToken().catch(() => {
          logOut("/login");
        });
      } else {
        router.push("/account/" + uid);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return (
    <>
      <LoggedInNav />
      <Main className="relative z-0">
        <Image
          src={accountLoading}
          alt="Loading"
          className="w-24 md:w-48 object-contain"
        />
      </Main>
    </>
  );
};

const Redirect = () => {
  return (
    <Suspense>
      <Base />
    </Suspense>
  );
};

export default Redirect;
