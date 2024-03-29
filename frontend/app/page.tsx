"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

import { useConst } from "./providers";
import { useAuthEffect } from "./lib/callbacks";

import { LoggedOutNav } from "./ui/Nav";
import Main from "./ui/Main";
import Header from "./ui/Header";
import Search from "./home/Search";
import { Button } from "./ui/Button";
import Support from "./home/Support";
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
        className={`flex flex-col min-h-screen ${
          verifiedLoggedOut ? "block" : "hidden"
        }`}
      >
        <LoggedOutNav showSignUp={false} />
        <Main className="gap-12 md:gap-24">
          <Header>
            <h1 className="text-4xl md:text-6xl">Dilemma</h1>
            {
              // Change steps of typewriter effect if text is changed
            }
            <h2 className="text-xl md:text-3xl subtitle">
              Manage real estate easily.
            </h2>
          </Header>
          <div className="gap-4 flex flex-col items-center justify-center w-60 md:w-72">
            <p className="text-base md:text-lg">
              Try out our home search tool:
            </p>
            <Search />
          </div>
          <div className="gap-4 flex flex-col items-center justify-center w-60 md:w-72">
            <p className="text-base md:text-lg">
              To upload documents and connect with buyers and sellers directly:
            </p>
            <Button
              onClick={() => {
                router.push("/signup");
              }}
              className="p-3 text-lg md:text-xl w-40 md:w-60 whitespace-nowrap"
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
