import React, { Suspense } from "react";
import HomePage from "./home/HomePage";
import { LoggedOutNav, LoggedInNav } from "./(util)/nav/LoggedInNav";

function App() {
  return (
    <>
      <Suspense fallback={<LoggedOutNav />}>
        <LoggedInNav />
      </Suspense>
      <HomePage />
    </>
  );
}

export default App;
