"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import PropTypes from "prop-types";

// Utility function to remove protocol and trailing slash from URL
const formatUrl = (url: string | undefined) =>
  url ? url.replace(/(^\w+:|^)\/\//, "").replace(/\/$/, "") : "";

// Only add port for localhost
const apiUrlBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const apiUrlPort = process.env.NEXT_PUBLIC_API_PORT
  ? `:${process.env.NEXT_PUBLIC_API_PORT}`
  : "";
const apiUrl = `${apiUrlBase}${apiUrlPort}`;

const websocketUrlBase = `wss://${formatUrl(process.env.NEXT_PUBLIC_API_URL)}`;
const websocketUrlPort = process.env.NEXT_PUBLIC_API_PORT
  ? `:${process.env.NEXT_PUBLIC_API_PORT}`
  : "";
const websocketURL = `${websocketUrlBase}${websocketUrlPort}`;

// Adjust the context's default value to match the expected types
const ConstContext = createContext({
  token: "",
  setToken: (token: string) => {},
  uid: "",
  setUid: (uid: string) => {},
  apiUrl,
  websocketURL,
});

export const useConst = () => useContext(ConstContext);

const ConstProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string>("");
  const [uid, setUid] = useState<string>("");

  const memoizedSetToken = useCallback(
    (newToken: string) => setToken(newToken),
    []
  );
  const memoizedSetUid = useCallback((newUid: string) => setUid(newUid), []);

  const value = useMemo(
    () => ({
      token,
      setToken: memoizedSetToken,
      uid,
      setUid: memoizedSetUid,
      apiUrl,
      websocketURL,
    }),
    [token, memoizedSetToken, uid, memoizedSetUid]
  );

  return (
    <ConstContext.Provider value={value}>{children}</ConstContext.Provider>
  );
};

ConstProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ConstProvider;
