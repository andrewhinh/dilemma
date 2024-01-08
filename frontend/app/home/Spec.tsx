import Link from "next/link";

import Header from "../ui/Header";
import Button from "../ui/Button";

function Spec() {
  return (
    <>
      <Header>
        <h1 className="text-4xl md:text-6xl">Dilemma</h1>
        {
          // Change steps of typewriter effect if text is changed
        }
        <h2 className="text-xl md:text-3xl subtitle">
          Multiplayer Learning
        </h2>
      </Header>
      <div className="gap-2 flex flex-col items-center justify-center w-60 md:w-72">
        <p className="text-base md:text-lg">Learning can be boring.</p>
        <p className="text-base md:text-lg">But it doesn&apos;t have to be.</p>
        <p className="text-base md:text-lg line-3">
          Experience a new way to learn.
        </p>
      </div>
      <div className="button gap-2 flex flex-col md:flex-row items-center justify-center">
        <Link href="/signup">
          <Button className="whitespace-nowrap">Join Now</Button>
        </Link>
        <p className="text-base md:text-lg">or</p>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </div>
    </>
  );
}

export default Spec;
