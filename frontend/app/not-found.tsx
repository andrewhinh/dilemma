/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { MainNav } from "./ui/Nav";
import Header from "./ui/Header";
import Main from "./ui/Main";

const ErrorPage = () => {
  return (
    <>
      <MainNav />
      <Main>
        <Header>
          <h1 className="text-4xl md:text-6xl">404</h1>
          <h2 className="text-2xl whitespace-nowrap">Page not found</h2>
          <h3 className="text-md md:text-xl whitespace-nowrap">
            <Link href="/" className="underline hover:opacity-50">
              Return to the home page.
            </Link>
          </h3>
        </Header>
      </Main>
    </>
  );
};

export default ErrorPage;
