"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

import { useConst } from "../providers";
import { useAuthEffect } from "../lib/callbacks";

import { MainNav } from "../ui/Nav";
import Main from "../ui/Main";
import Header from "../ui/Header";
import Search from "../home/Search";
import pageLoading from "@/public/page-loading.svg";

function App() {
  const router = useRouter();
  const { state } = useConst();
  const { verifiedLoggedOut } = state;

  useAuthEffect({});

  return (
    <>
      <div
        className={`flex flex-col ${
          verifiedLoggedOut ? "block" : "hidden"
        }`}
      >
        <Main className="gap-12">
          <Header>
            <h1 className="text-2xl md:text-4xl w-60 md:w-96">
              Search properties to buy or rent:
            </h1>
          </Header>
          <Search />
        </Main>
      </div>
      <Main className={verifiedLoggedOut ? "hidden" : "block"}>
        <Image
          src={pageLoading}
          alt="Loading"
          className="w-24 md:w-48 object-contain"
        />
      </Main>
    </>
  );
}

export default App;
