"use client";

import { useConst } from "../providers";
import { useSendRequest } from "../lib/utils";
import { useProfile } from "./providers";

import validator from "validator";

// Type definitions
interface User {
  uid: string;
  username: string;
  status: string;
}

interface FriendRequest {
  uid: string;
  username: string;
  status: string;
  request_date: string;
}

interface Friend {
  uid: string;
  username: string;
  status: string;
  friendship_date: string;
}

interface Action {
  type: string;
  field?: keyof State;
  payload?: any;
}

interface State {
  profileView: string;
  isSideBarOpen: boolean;
  email: string;
  username: string;
  fullname: string;
  password: string;
  confirmPassword: string;
  updateUserErrorMsg: string;
  updateUserSuccessMsg: string;
  updateUserLoading: boolean;
  pwdErrorMsg: string;
  pwdSuccessMsg: string;
  pwdLoading: boolean;
  deleteAccountErrorMsg: string;
  deleteAccountLoading: boolean;
  deleteAccountConfirm: string;
  requestUsername: string;
  sentFriendRequests: FriendRequest[];
  sendRequestErrorMsg: string;
  sendRequestSuccessMsg: string;
  sendRequestLoading: boolean;
  incomingFriendRequests: FriendRequest[];
  acceptRequestErrorMsg: string;
  acceptRequestLoading: boolean;
  declineRequestErrorMsg: string;
  declineRequestLoading: boolean;
  deleteFriendErrorMsg: string;
  friends: Friend[];
  deleteFriendLoading: boolean;
}

export type { User, FriendRequest, Friend, Action, State };

// Helper functions
const useGetSentFriendRequests = () => {
  const { apiUrl } = useConst();
  const sendRequest = useSendRequest();
  const { dispatch } = useProfile();
  const getSentFriendRequestsUrl = apiUrl + "/friends/requests/sent";

  return () => {
    sendRequest(getSentFriendRequestsUrl, "GET").then((data) => {
      dispatch({
        type: "SET_FIELD",
        field: "sentFriendRequests",
        payload: data,
      });
    });
  };
};

const useGetIncomingFriendRequests = () => {
  const { apiUrl } = useConst();
  const sendRequest = useSendRequest();
  const { dispatch } = useProfile();
  const getIncomingFriendRequestsUrl = apiUrl + "/friends/requests/incoming";

  return () => {
    sendRequest(getIncomingFriendRequestsUrl, "GET").then((data) => {
      dispatch({
        type: "SET_FIELD",
        field: "incomingFriendRequests",
        payload: data,
      });
    });
  };
};

const useGetFriends = () => {
  const { apiUrl } = useConst();
  const sendRequest = useSendRequest();
  const { dispatch } = useProfile();
  const getFriendsUrl = apiUrl + "/friends/";

  return () => {
    sendRequest(getFriendsUrl, "GET").then((data) => {
      dispatch({
        type: "SET_FIELD",
        field: "friends",
        payload: data,
      });
    });
  };
};

const useGetUser = () => {
  const { apiUrl } = useConst();
  const sendRequest = useSendRequest();
  const { dispatch } = useProfile();
  const getSentFriendRequests = useGetSentFriendRequests();
  const getIncomingFriendRequests = useGetIncomingFriendRequests();
  const getFriends = useGetFriends();

  const getUserUrl = apiUrl + "/user/";

  return () => {
    dispatch({ type: "SET_UPDATE_USER_ERROR_MSG", payload: null });
    dispatch({ type: "SET_UPDATE_USER_LOADING", payload: true });
    dispatch({ type: "SET_UPDATE_USER_SUCCESS_MSG", payload: null });

    sendRequest(getUserUrl, "GET")
      .then((data) => {
        dispatch({
          type: "SET_PROFILE_VIEW",
          payload: data.profile_view,
        });
        dispatch({
          type: "SET_IS_SIDEBAR_OPEN",
          payload: data.is_sidebar_open,
        });
        dispatch({ type: "SET_FIELD", field: "email", payload: data.email });
        dispatch({
          type: "SET_FIELD",
          field: "username",
          payload: data.username,
        });
        dispatch({
          type: "SET_FIELD",
          field: "fullname",
          payload: data.fullname,
        });
        if (data.sent_friend_requests !== null) getSentFriendRequests();
        if (data.incoming_friend_requests !== null) getIncomingFriendRequests();
        if (data.friends !== null) getFriends();
      })
      .catch((error) => {
        dispatch({
          type: "SET_UPDATE_USER_ERROR_MSG",
          payload: error.detail || error,
        });
      })
      .finally(() => {
        dispatch({ type: "SET_UPDATE_USER_LOADING", payload: false });
      });
  };
};

const useUpdateUser = () => {
  const { apiUrl, setToken } = useConst();
  const sendRequest = useSendRequest();
  const { state, dispatch } = useProfile();

  const { email, username, fullname, profileView, isSideBarOpen } = state;

  const updateUserUrl = apiUrl + "/user/update";

  return (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    view: string | null,
    sidebar: boolean | null
  ) => {
    e.preventDefault();

    dispatch({ type: "SET_UPDATE_USER_ERROR_MSG", payload: null });
    dispatch({ type: "SET_UPDATE_USER_SUCCESS_MSG", payload: null });

    if (view === null && sidebar === null)
      dispatch({ type: "SET_UPDATE_USER_LOADING", payload: true });

    dispatch({
      type: "SET_PROFILE_VIEW",
      payload: view !== null ? view : profileView,
    });
    dispatch({
      type: "SET_IS_SIDEBAR_OPEN",
      payload: sidebar !== null ? sidebar : isSideBarOpen,
    });

    if (email === "") {
      dispatch({
        type: "SET_UPDATE_USER_ERROR_MSG",
        payload: "Email cannot be empty",
      });
      dispatch({ type: "SET_UPDATE_USER_LOADING", payload: false });
      return;
    }

    if (!validator.isEmail(email)) {
      dispatch({
        type: "SET_UPDATE_USER_ERROR_MSG",
        payload: "Email is invalid",
      });
      dispatch({ type: "SET_UPDATE_USER_LOADING", payload: false });
      return;
    }

    let request = {
      email: email,
      username: username,
      fullname: fullname,
      profile_view: view !== null ? view : profileView,
      is_sidebar_open: sidebar !== null ? sidebar : isSideBarOpen,
    };
    sendRequest(updateUserUrl, "PATCH", request)
      .then((response) => {
        if (response.access_token) setToken(response.access_token); // new email generates new token
        if (view === null && sidebar === null)
          dispatch({
            type: "SET_UPDATE_USER_SUCCESS_MSG",
            payload: "User updated!",
          });
      })
      .catch((error) =>
        dispatch({
          type: "SET_UPDATE_USER_ERROR_MSG",
          payload: error.detail || error,
        })
      )
      .finally(() =>
        dispatch({ type: "SET_UPDATE_USER_LOADING", payload: false })
      );
  };
};

export { useGetUser, useUpdateUser };
