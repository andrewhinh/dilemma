"use client";

import { useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useConst } from "../providers";
import { sendRequest } from "../lib/api";
import { useRefreshToken, useLogOut } from "../lib/callbacks";

import { LoggedInNav } from "../ui/Nav";
import Main from "../ui/Main";
import profileLoading from "@/public/profile-loading.svg";

const Redirect = () => {
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
        if (data.detail) router.push("/login");
        else if (data.url) router.push(data.url);
        else {
          dispatch({
            type: "SET_LOGGED_IN",
            payload: true,
          });
          dispatch({
            type: "SET_UID",
            payload: data.uid,
          });
          router.push("/profile" + data.uid);
        }
      });
    } else {
      if (!isLoggedIn) {
        refreshToken().catch(() => {
          logOut("/login");
        });
      } else {
        router.push("profile/" + uid);
      }
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

// Wrap the Redirect component in a Suspense component since
// Redirect uses useSearchParams
const Final = () => {
  return (
    <Suspense>
      <Redirect />
    </Suspense>
  );
};

export default Final;
