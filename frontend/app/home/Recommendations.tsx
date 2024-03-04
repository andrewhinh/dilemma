"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Path } from "../providers";
import { sendRequest } from "../lib/api";
import pageLoading from "@/public/page-loading.svg";

function Recommendations() {
  const paths = useRef<Path[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    paths.current = [];
    setErrorMsg("");
    sendRequest("/paths", "GET").then((data) => {
      if (data.detail) {
        setErrorMsg(data.detail);
      } else {
        paths.current = data;
      }
    });
  }, []);

  return (
    <>
      <div>
        {paths.current.map((path) =>
          path.items.map((item) => (
            <div key={item.uid}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))
        )}
      </div>
      <div
        className={paths.current.length === 0 && errorMsg === "" ? "block" : ""}
      >
        <Image
          src={pageLoading}
          alt="Loading"
          className="w-24 md:w-48 object-contain"
        />
      </div>
      <div className={errorMsg === "" ? "hidden" : "block"}>
        <p>{errorMsg}</p>
      </div>
    </>
  );
}

export default Recommendations;
