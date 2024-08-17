import React from "react";

function Support() {
  return (
    <footer className="w-full h-16 p-4 bg-slate-300 text-zinc-500 flex justify-center items-center">
      <h3 className="text-lg font-semibold">
        <a
          href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}
          className="hover:opacity-50 transition duration-300 ease-in-out"
        >
          Contact Support
        </a>
      </h3>
    </footer>
  );
}

export default Support;