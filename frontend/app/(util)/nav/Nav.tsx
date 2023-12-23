/* eslint-disable @next/next/no-img-element */
import React, { ReactNode } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import homeURL from "@/public/home.png";

interface NavProps {
  children: ReactNode;
}

function Nav({ children }: NavProps) {
  return (
    <nav className="flex p-4 text-white bg-gradient-to-r from-pink-500 via-purple-500 to-blue-400">
      <div className="flex-1 text-left">
        <Link href="/" className="hover:text-blue-500">
          <img
            src={homeURL.src}
            alt="Home Link"
            className="object-contain h-6 hover:opacity-50"
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
