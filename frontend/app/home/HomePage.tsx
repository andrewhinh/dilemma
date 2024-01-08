"use client";

import React, { useEffect } from "react";
import { useConst } from "../providers";
import { useRefreshToken } from "../lib/utils";

import { LoggedInNav } from "../ui/Nav";
import Main from "../ui/Main";
import Spec from "./Spec";
import Upload from "./Upload";
import Support from "./Support";

function HomePage() {
  const { token } = useConst();
  const refreshToken = useRefreshToken();

  useEffect(() => {
    if (!token) refreshToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <>
      {token ? (
        <>
          <LoggedInNav />
          <Main className="gap-12 md:gap-24">
            <Upload />
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
