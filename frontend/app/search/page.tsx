"use client";

import Main from "../ui/Main";
import Search from "./Search";
import { MainNav } from "../ui/Nav";
import Support from "../home/Support";

function App() {
  return (
    <>
      <MainNav />
      <Main className="gap-4">
        <Search />
      </Main>
      <Support />
    </>
  );
}

export default App;
