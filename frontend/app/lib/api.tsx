"use server";

import { cookies } from "next/headers";

// Helper vars and functions

// const removeProtocol = (url: string | undefined) =>
//   url ? url.replace(/(^\w+:|^)\/\//, "") : "";

const removeTrailingSlash = (url: string | undefined) =>
  url ? url.replace(/\/$/, "") : "";

// const websocketUrlBase = `wss://${removeProtocol(removeTrailingSlash(process.env.API_URL))}`;
// const websocketUrlPort = process.env.API_PORT ? `:${process.env.API_PORT}` : "";
// const websocketURL = `${websocketUrlBase}${websocketUrlPort}`;

// Only add port for localhost
const apiUrlBase = removeTrailingSlash(process.env.API_URL);
const apiUrlPort = process.env.API_PORT ? `:${process.env.API_PORT}` : "";
const apiUrl = `${apiUrlBase}${apiUrlPort}`;

const sendRequest = async (route: string, method: string, data: any = null) => {
  let request: RequestInit = {
    method: method,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.API_KEY || "",
      Cookie: cookies().toString(),
    },
    credentials: "include",
  };

  let body = null;
  if (data !== null && (method === "PATCH" || method === "POST")) {
    body = JSON.stringify(data);
  }
  if (body !== null) {
    request = { ...request, body };
  }

  const response = await fetch(`${apiUrl}${route}`, request);
  const result = await response.json();

  const receivedCookies = response.headers.getSetCookie();
  if (receivedCookies) {
    receivedCookies.forEach((cookie) => {
      cookies().set({
        name: cookie.split("=")[0],
        value: cookie.split("=")[1].split(";")[0],
        httpOnly: true,
        maxAge: parseInt(cookie.split(";")[2].split("=")[1]),
        path: "/",
        sameSite: "none",
        secure: true,
      });
    });
  }

  return result; // can't check if response.ok here because server errors aren't passed to client components
};

// const sendWebsocket = (
//     websocket: WebSocket,
//     setText: (value: string | ((prevValue: string) => string)) => void
//   ) => {
//     let timeout: number | NodeJS.Timeout | null | undefined = null;

//     websocket.onopen = () => {
//       timeout = setTimeout(() => {
//         websocket.close(1011, "timeout");
//       }, 15000);
//     };

//     websocket.onmessage = (event: MessageEvent) => {
//       if (timeout !== null) {
//         clearTimeout(timeout);
//       }
//       const data = JSON.parse(event.data);

//       if (data.status === "ERROR") {
//         websocket.close(1011, "error");
//       } else if (data.status === "DONE") {
//         setText(data.result);
//         websocket.close(1000, "success");
//       } else {
//         setText((prevMessage: string) => prevMessage + data.message);
//       }
//     };

//     websocket.onclose = (event) => {
//       if (timeout !== null) {
//         clearTimeout(timeout);
//       }
//       if (event.code !== 1000) {
//         setText("There was an error. Please try again later.");
//       }
//     };

//     websocket.onerror = () => {
//       websocket.close(1011, "error");
//     };
//   };

export { sendRequest };
