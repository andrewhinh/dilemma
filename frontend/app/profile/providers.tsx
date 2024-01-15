"use client";

import React, { createContext, useReducer, useContext } from "react";
import { Action, State } from "./utils";

const initialState: State = {
  getUserInfo: true,
  profileView: "",
  isSideBarOpen: false,
  profilePicture: "",
  email: "",
  username: "",
  fullname: "",
  password: "",
  confirmPassword: "",
  canUpdateUser: false,
  updateUserErrorMsg: "",
  updateUserLoading: false,
  pwdErrorMsg: "",
  pwdSuccessMsg: "",
  pwdLoading: false,
  deleteAccountErrorMsg: "",
  deleteAccountLoading: false,
  deleteAccountConfirm: "",
  requestUsername: "",
  sentFriendRequests: [],
  sendRequestErrorMsg: "",
  sendRequestLoading: false,
  revertRequestErrorMsg: "",
  revertRequestLoading: false,
  incomingFriendRequests: [],
  acceptRequestErrorMsg: "",
  acceptRequestLoading: false,
  declineRequestErrorMsg: "",
  declineRequestLoading: false,
  friends: [],
  deleteFriendErrorMsg: "",
  deleteFriendLoading: false,
};

interface ProfileContextType {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const ProfileContext = createContext<ProfileContextType>({
  state: initialState,
  dispatch: () => undefined,
});

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_FIELD":
      if (action.field) {
        return { ...state, [action.field]: action.payload };
      }
      return state;
    case "SET_GET_USER_INFO":
      return { ...state, getUserInfo: action.payload };
    case "SET_CAN_UPDATE_USER":
      return { ...state, canUpdateUser: action.payload };
    case "SET_UPDATE_USER_ERROR_MSG":
      return { ...state, updateUserErrorMsg: action.payload };
    case "SET_UPDATE_USER_LOADING":
      return { ...state, updateUserLoading: action.payload };
    case "SET_PWD_ERROR_MSG":
      return { ...state, pwdErrorMsg: action.payload };
    case "SET_PWD_LOADING":
      return { ...state, pwdLoading: action.payload };
    case "SET_PWD_SUCCESS_MSG":
      return { ...state, pwdSuccessMsg: action.payload };
    case "SET_DELETE_ACCOUNT_ERROR_MSG":
      return { ...state, deleteAccountErrorMsg: action.payload };
    case "SET_DELETE_ACCOUNT_LOADING":
      return { ...state, deleteAccountLoading: action.payload };
    case "SET_SEND_REQUEST_ERROR_MSG":
      return { ...state, sendRequestErrorMsg: action.payload };
    case "SET_SEND_REQUEST_LOADING":
      return { ...state, sendRequestLoading: action.payload };
    case "SET_REVERT_REQUEST_ERROR_MSG":
      return { ...state, revertRequestErrorMsg: action.payload };
    case "SET_REVERT_REQUEST_LOADING":
      return { ...state, revertRequestLoading: action.payload };
    case "SET_ACCEPT_REQUEST_ERROR_MSG":
      return { ...state, acceptRequestErrorMsg: action.payload };
    case "SET_ACCEPT_REQUEST_LOADING":
      return { ...state, acceptRequestLoading: action.payload };
    case "SET_DECLINE_REQUEST_ERROR_MSG":
      return { ...state, declineRequestErrorMsg: action.payload };
    case "SET_DECLINE_REQUEST_LOADING":
      return { ...state, declineRequestLoading: action.payload };
    case "SET_DELETE_FRIEND_ERROR_MSG":
      return { ...state, deleteFriendErrorMsg: action.payload };
    case "SET_DELETE_FRIEND_LOADING":
      return { ...state, deleteFriendLoading: action.payload };
    default:
      return state;
  }
};

export const useProfile = () => {
  return useContext(ProfileContext);
};

export const ProfileProvider = ({ children }: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const contextValue = { state, dispatch };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};
