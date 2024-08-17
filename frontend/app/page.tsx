"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

import { useConst } from "./providers";
import { useAuthEffect } from "./lib/callbacks";

import { LoggedOutNav } from "./ui/Nav";
import Main from "./ui/Main";
import Header from "./ui/Header";
import Search from "./search/Search";
import { Button } from "./ui/Button";
import Support from "./ui/Support";
import pageLoading from "@/public/page-loading.svg";

function App() {
  const router = useRouter();
  const { state } = useConst();
  const { verifiedLoggedOut } = state;

  useAuthEffect({
    onSuccess: () => {
      router.push("/home");
    },
  });

  return (
    <>
      <div
        className={`flex flex-col flex-1 ${verifiedLoggedOut ? "block" : "hidden"}`}
      >
        <LoggedOutNav showSignUp={false} />
        <Main className="gap-16 md:gap-16">
          <Header>
            <h1 className="text-4xl md:text-6xl">Dilemma</h1>
            {
              // Change steps of typewriter effect if text is changed
            }
            <h2 className="text-xl md:text-3xl subtitle">
              Real estate website demo.
            </h2>
          </Header>
          <div className="gap-4 flex flex-col w-60 md:w-72">
            <Search />
          </div>
          <div className="gap-4 flex flex-col items-center justify-center w-60 md:w-72">
            <p className="text-base md:text-lg">
              Create an account to contact sellers and create listings:
            </p>
            <Button
              onClick={() => {
                router.push("/signup");
              }}
              className="p-3 text-lg md:text-xl w-60 whitespace-nowrap"
            >
              <p>Sign Up</p>
            </Button>
          </div>
        </Main>
        <Support />
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
