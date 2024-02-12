"use client";

import { useRouter } from "next/navigation";
import { MainNav } from "./ui/Nav";
import Header from "./ui/Header";
import Main from "./ui/Main";
import { Button } from "./ui/Button";

const ErrorPage = () => {
  const router = useRouter();

  return (
    <>
      <MainNav />
      <Main>
        <Header>
          <h1 className="text-4xl md:text-6xl">404</h1>
          <h2 className="text-2xl whitespace-nowrap">Page not found</h2>
          <Button
            className="p-3 w-full text-lg md:text-xl whitespace-nowrap"
            onClick={() => router.back()}
          >
            <p>Go back</p>
          </Button>
        </Header>
      </Main>
    </>
  );
};

export default ErrorPage;
