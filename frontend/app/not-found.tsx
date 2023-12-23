/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useConst } from "./providers";
import { LoggedOutNav, LoggedInNav } from "./(util)/nav/LoggedInNav";
import Main from "./(util)/ui/Main";
import { useSendWebsocket } from "./(util)/lib/HelperFns";
import wsLoading from "@/public/ws-loading.svg";

const ErrorPage = () => {
  const defaultMessage = "You're not supposed to be here!";
  const [text, setText] = useState("");
  const [isFetchingComplete, setIsFetchingComplete] = useState(false);

  const sendWebsocket = useSendWebsocket();
  const { websocketURL } = useConst();
  const websocketRef = useRef<WebSocket | null>(null);
  const route = "/lost";

  const fetchLostMessage = async () => {
    if (
      !websocketRef.current ||
      websocketRef.current.readyState === WebSocket.CLOSED
    ) {
      websocketRef.current = new WebSocket(websocketURL + route);
    }
    sendWebsocket(
      websocketRef.current,
      setText,
      setIsFetchingComplete,
      defaultMessage
    );
  };

  useEffect(() => {
    setText("");
    setIsFetchingComplete(false);
    fetchLostMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Suspense fallback={<LoggedOutNav />}>
        <LoggedInNav />
      </Suspense>
      <Main header="Lost, are we?">
        {text ? (
          <h2 className="text-2xl mb-8">{text}</h2>
        ) : (
          <img
            src={wsLoading.src}
            alt="Loading"
            className="object-contain w-48 max-h-48"
          />
        )}
        {isFetchingComplete && (
          <div>
            <h2 className="text-2xl">
              Go{" "}
              <Link href="/" className="hover:text-blue-500 underline">
                home
              </Link>{" "}
              ya dingus!
            </h2>
          </div>
        )}
      </Main>
    </>
  );
};

export default ErrorPage;
