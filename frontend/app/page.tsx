"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

import { useConst } from "./providers";
import { useAuthEffect } from "./lib/callbacks";

import { LoggedOutNav } from "./ui/Nav";
import Main from "./ui/Main";
import Spec from "./home/Spec";
import Recommendations from "./home/Recommendations";
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
          <Spec />
          <Recommendations />
          <Button
            onClick={() => {
              router.push("/signup");
            }}
            className="p-3 text-lg md:text-xl w-40 md:w-60 whitespace-nowrap"
          >
            <p>Get Started</p>
          </Button>
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
