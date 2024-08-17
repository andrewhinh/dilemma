"use client";

import React, { createContext, useReducer, useContext } from "react";

interface Action {
  type: string;
  field?: keyof State;
  payload?: any;
}

interface State {
  canUpdateUser: boolean;
  updateUserErrorMsg: string;
  updateUserLoading: boolean;
  revertRequestErrorMsg: string;
  revertRequestLoading: boolean;
  acceptRequestErrorMsg: string;
  acceptRequestLoading: boolean;
  declineRequestErrorMsg: string;
  declineRequestLoading: boolean;
  deleteChatErrorMsg: string;
  deleteChatLoading: boolean;
}

const initialState: State = {
  canUpdateUser: false,
  updateUserErrorMsg: "",
  updateUserLoading: false,
  revertRequestErrorMsg: "",
  revertRequestLoading: false,
  acceptRequestErrorMsg: "",
  acceptRequestLoading: false,
  declineRequestErrorMsg: "",
  declineRequestLoading: false,
  deleteChatErrorMsg: "",
  deleteChatLoading: false,
};

interface AccountContextType {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const AccountContext = createContext<AccountContextType>({
  state: initialState,
  dispatch: () => undefined,
});

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_CAN_UPDATE_USER":
      return { ...state, canUpdateUser: action.payload };
    case "SET_UPDATE_USER_ERROR_MSG":
      return { ...state, updateUserErrorMsg: action.payload };
    case "SET_UPDATE_USER_LOADING":
      return { ...state, updateUserLoading: action.payload };
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
    case "SET_DELETE_CHAT_ERROR_MSG":
      return { ...state, deleteChatErrorMsg: action.payload };
    case "SET_DELETE_CHAT_LOADING":
      return { ...state, deleteChatLoading: action.payload };
    default:
      return state;
  }
};

export const useAccount = () => {
  return useContext(AccountContext);
};

export const AccountProvider = ({ children }: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const contextValue = { state, dispatch };

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
};
