/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import { useConst } from "../providers";
import { useSendWebsocket } from "../(util)/lib/HelperFns";
import wsLoading from "@/public/ws-loading.svg";

function FunFact() {
  const defaultMessage = "Dogs are cool!";
  const [text, setText] = useState("");
  const [isFetchingComplete, setIsFetchingComplete] = useState(false);

  const sendWebsocket = useSendWebsocket();
  const { websocketURL } = useConst();
  const websocketRef = useRef<WebSocket | null>(null);
  const route = "/fact";

  const fetchFunFact = async () => {
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
    fetchFunFact();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleButtonClick = async () => {
    setText("");
    setIsFetchingComplete(false);
    await fetchFunFact();
  };

  return (
    <aside className="p-8 rounded-lg shadow-md flex flex-col justify-center items-center text-center gap-4">
      <h2 className="text-2xl font-bold">Did you know?</h2>
      {text ? (
        <p className="text-left max-w-lg">{text}</p>
      ) : (
        <img
          src={wsLoading.src}
          alt="Loading"
          className="object-contain w-24 max-h-24"
        />
      )}
      {isFetchingComplete && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          type="button"
          onClick={handleButtonClick}
        >
          Another!
        </button>
      )}
    </aside>
  );
}

export default FunFact;
