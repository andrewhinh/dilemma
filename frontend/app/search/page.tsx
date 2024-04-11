"use client";

import Main from "../ui/Main";
import Header from "../ui/Header";
import Search from "./Search";
import { MainNav } from "../ui/Nav";
import Support from "../home/Support";

function App() {
  return (
    <>
      <MainNav />
      <Main className="gap-12">
        <Header>
          <h1 className="text-2xl md:text-4xl w-60 md:w-96">
            Search properties to buy or rent:
          </h1>
        </Header>
        <Search />
      </Main>
      <Support />
    </>
  );
}

export default App;
