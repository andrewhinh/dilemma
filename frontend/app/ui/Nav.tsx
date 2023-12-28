/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import React, { ReactNode } from "react";
import PropTypes from "prop-types";
import homeURL from "@/public/opengraph-image.jpg";

interface NavProps {
  children: ReactNode;
}

function Nav({ children }: NavProps) {
  return (
    <nav className="p-4 bg-cyan-200 text-zinc-500 flex">
      <div className="flex flex-1 justify-start">
        <Link href="/">
          <img
            src={homeURL.src}
            alt="Home Link"
            className="object-contain h-6 hover:opacity-50 transition 300ms ease-in-out"
          />
        </Link>
      </div>
      {children}
    </nav>
  );
}

Nav.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Nav;
