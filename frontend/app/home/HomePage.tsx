"use client";

import React, { useEffect } from "react";
import { useConst } from "../providers";
import { useRefreshToken } from "../lib/callbacks";

import { LoggedInNav } from "../ui/Nav";
import Main from "../ui/Main";
import Spec from "./Spec";
import { File } from "../ui/Upload";
import Support from "./Support";

function HomePage() {
  const { state } = useConst();
  const refreshToken = useRefreshToken();

  const { isLoggedIn } = state;

  useEffect(() => {
    if (!isLoggedIn) refreshToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return (
    <>
      {isLoggedIn ? (
        <>
          <LoggedInNav />
          <Main className="gap-12 md:gap-24">
            <File />
          </Main>
          <Support />
        </>
      ) : (
        <Main className="gap-12 md:gap-24">
          <Spec />
        </Main>
      )}
    </>
  );
}

export default HomePage;
