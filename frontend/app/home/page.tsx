"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import { useRefreshToken } from "../lib/callbacks";
import {
  useSetUser,
  useGetSentFriendRequests,
  useGetIncomingFriendRequests,
  useGetFriends,
} from "../utils";
import { sendRequest } from "../lib/api";
import { useConst } from "../providers";

import { LoggedInNav } from "../ui/Nav";
import Main from "../ui/Main";
import Support from "./Support";
import pageLoading from "@/public/page-loading.svg";

function Base() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const refreshToken = useRefreshToken();
  const setUser = useSetUser();
  const { state, dispatch } = useConst();
  const getSentFriendRequests = useGetSentFriendRequests();
  const getIncomingFriendRequests = useGetIncomingFriendRequests();
  const getFriends = useGetFriends();

  const { verifiedLoggedOut, isLoggedIn } = state;

  useEffect(() => {
    const authCode = searchParams.get("code");
    const authState = searchParams.get("state");

    if (authCode && authState) {
      sendRequest("/token/google", "POST", {
        code: authCode,
        state: authState,
      }).then((data) => {
        if (data.detail) {
          router.push("/" + authState + "?error=" + data.detail);
        } else {
          dispatch({
            type: "SET_VERIFIED_LOGGED_OUT",
            payload: false,
          });
          dispatch({
            type: "SET_LOGGED_IN",
            payload: true,
          });
          setUser(data);
          getSentFriendRequests();
          getIncomingFriendRequests();
          getFriends();
        }
      });
    } else {
      // reimplement useAuthEffect b/c doesn't work if 2 useEffects are used
      if (verifiedLoggedOut) {
        router.push("/");
      } else {
        if (!isLoggedIn) {
          refreshToken().catch(() => {
            router.push("/");
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        className={`flex flex-col min-h-screen ${
          isLoggedIn ? "block" : "hidden"
        }`}
      >
        <LoggedInNav />
        <Main className="gap-20">
          <h1 className="text-3xl md:text-5xl font-bold text-center">
            Welcome to the app!
          </h1>
        </Main>
        <Support />
      </div>
      <Main className={isLoggedIn ? "hidden" : "block"}>
        <Image
          src={pageLoading}
          alt="Loading"
          className="w-24 md:w-48 object-contain"
        />
      </Main>
    </>
  );
}

const HomePage = () => {
  return (
    <Suspense>
      <Base />
    </Suspense>
  );
};

export default HomePage;
