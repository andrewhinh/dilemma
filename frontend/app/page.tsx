import React, { Suspense } from "react";
import { LoggedOutNav, LoggedInNav } from "./ui/LoggedInNav";
import HomePage from "./home/HomePage";
import Support from "./home/Support";

function App() {
  return (
    <>
      <Suspense fallback={<LoggedOutNav />}>
        <LoggedInNav />
      </Suspense>
      <HomePage />
      <Support />
    </>
  );
}

export default App;
