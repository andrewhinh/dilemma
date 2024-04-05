"use client";

import React, { createContext, useReducer, useContext } from "react";

interface User {
  joinDate: Date;
  provider: string;
  profilePicture: string;
  email: string;
  firstName: string;
  lastName: string;
  accountView: string;
  isSideBarOpen: boolean;
  uuid: string;
  sentChatRequests: Array<any>;
  receivedChatRequests: Array<any>;
}

// Type for the user object that is returned from the backend
interface UserBackend {
  join_date?: string;
  provider?: string;
  profile_picture?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  account_view?: string;
  is_sidebar_open?: boolean;
  uuid?: string;
  requester_links?: Array<any>;
  receiver_links?: Array<any>;
}

export type { UserBackend };

interface State extends User {
  verifiedLoggedOut: boolean;
  isLoggedIn: boolean;
  getUserInfo: boolean;
}

const initialState: State = {
  verifiedLoggedOut: false,
  isLoggedIn: false,
  getUserInfo: true,
  joinDate: new Date(),
  provider: "",
  profilePicture: "",
  email: "",
  firstName: "",
  lastName: "",
  accountView: "",
  isSideBarOpen: false,
  uuid: "",
  sentChatRequests: [],
  receivedChatRequests: [],
};

interface Action {
  type: string;
  field?: keyof State;
  payload?: any;
}

interface ConstContextType {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const ConstContext = createContext<ConstContextType>({
  state: initialState,
  dispatch: () => undefined,
});

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_VERIFIED_LOGGED_OUT":
      return { ...state, verifiedLoggedOut: action.payload };
    case "SET_LOGGED_IN":
      return { ...state, isLoggedIn: action.payload };
    case "SET_GET_USER_INFO":
      return { ...state, getUserInfo: action.payload };
    case "SET_JOIN_DATE":
      return { ...state, joinDate: action.payload };
    case "SET_PROVIDER":
      return { ...state, provider: action.payload };
    case "SET_PROFILE_PICTURE":
      return { ...state, profilePicture: action.payload };
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "SET_FIRST_NAME":
      return { ...state, firstName: action.payload };
    case "SET_LAST_NAME":
      return { ...state, lastName: action.payload };
    case "SET_ACCOUNT_VIEW":
      return { ...state, accountView: action.payload };
    case "SET_IS_SIDEBAR_OPEN":
      return { ...state, isSideBarOpen: action.payload };
    case "SET_UUID":
      return { ...state, uuid: action.payload };
    case "SET_SENT_CHAT_REQUESTS":
      return { ...state, sentChatRequests: action.payload };
    case "SET_RECEIVED_CHAT_REQUESTS":
      return { ...state, receivedChatRequests: action.payload };
    default:
      return state;
  }
};

export const useConst = () => useContext(ConstContext);

export const ConstProvider = ({ children }: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const contextValue = { state, dispatch };

  return (
    <ConstContext.Provider value={contextValue}>
      {children}
    </ConstContext.Provider>
  );
};
