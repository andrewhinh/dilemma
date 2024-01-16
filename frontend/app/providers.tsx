"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import PropTypes from "prop-types";

// Adjust the context's default value to match the expected types
const ConstContext = createContext({
  isLoggedIn: false,
  setIsLoggedIn: (isLoggedIn: boolean) => {},
  uid: "",
  setUid: (uid: string) => {},
});

export const useConst = () => useContext(ConstContext);

const ConstProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [uid, setUid] = useState<string>("");

  const memoizedSetIsLoggedIn = useCallback(
    (newIsLoggedIn: boolean) => setIsLoggedIn(newIsLoggedIn),
    []
  );
  const memoizedSetUid = useCallback((newUid: string) => setUid(newUid), []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      setIsLoggedIn: memoizedSetIsLoggedIn,
      uid,
      setUid: memoizedSetUid,
    }),
    [isLoggedIn, memoizedSetIsLoggedIn, uid, memoizedSetUid]
  );

  return (
    <ConstContext.Provider value={value}>{children}</ConstContext.Provider>
  );
};

ConstProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ConstProvider;
