"use client";

import React, { createContext, useReducer, useContext } from "react";

interface User {
  joinDate: Date;
  provider: string;
  profilePicture: string;
  email: string;
  username: string;
  fullname: string;
  accountView: string;
  isSideBarOpen: boolean;
  uid: string;
}

// Type for the user object that is returned from the backend
interface UserBackend {
  join_date?: string;
  provider?: string;
  profile_picture?: string;
  email?: string;
  username?: string;
  fullname?: string;
  account_view?: string;
  is_sidebar_open?: boolean;
  uid?: string;
}

interface FriendBase {
  uid: string;
  join_date: Date;
  profile_picture?: string;
  username: string;
}

interface FriendRequest extends FriendBase {
  request_date: string;
}

interface Friend extends FriendBase {
  friendship_date: string;
}

interface CompleteUser extends User {
  sentFriendRequests: FriendRequest[];
  incomingFriendRequests: FriendRequest[];
  friends: Friend[];
  provider: string;
}

export type { UserBackend, FriendRequest, Friend };

interface State extends CompleteUser {
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
  username: "",
  fullname: "",
  accountView: "",
  isSideBarOpen: false,
  uid: "",
  sentFriendRequests: [],
  incomingFriendRequests: [],
  friends: [],
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
    case "SET_USERNAME":
      return { ...state, username: action.payload };
    case "SET_FULLNAME":
      return { ...state, fullname: action.payload };
    case "SET_ACCOUNT_VIEW":
      return { ...state, accountView: action.payload };
    case "SET_IS_SIDEBAR_OPEN":
      return { ...state, isSideBarOpen: action.payload };
    case "SET_UID":
      return { ...state, uid: action.payload };
    case "SET_SENT_FRIEND_REQUESTS":
      return { ...state, sentFriendRequests: action.payload };
    case "SET_INCOMING_FRIEND_REQUESTS":
      return { ...state, incomingFriendRequests: action.payload };
    case "SET_FRIENDS":
      return { ...state, friends: action.payload };
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
