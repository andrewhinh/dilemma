import { useConst } from "../providers";
import { sendRequest } from "../api/route";
import { useProfile } from "./providers";

import validator from "validator";

// Type definitions
interface User {
  uid: string;
  join_date: Date;
  profile_picture?: string;
  username: string;
}

interface FriendRequest {
  uid: string;
  join_date: Date;
  profile_picture?: string;
  username: string;
  request_date: string;
}

interface Friend {
  uid: string;
  join_date: Date;
  profile_picture?: string;
  username: string;
  friendship_date: string;
}

interface Action {
  type: string;
  field?: keyof State;
  payload?: any;
}

interface State {
  getUserInfo: boolean;
  profileView: string;
  isSideBarOpen: boolean;
  profilePicture: string;
  email: string;
  username: string;
  fullname: string;
  password: string;
  confirmPassword: string;
  canUpdateUser: boolean;
  updateUserErrorMsg: string;
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
  sendRequestLoading: boolean;
  revertRequestErrorMsg: string;
  revertRequestLoading: boolean;
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
  const { dispatch } = useProfile();

  return () => {
    sendRequest("/friends/requests/sent", "GET").then((data) => {
      dispatch({
        type: "SET_FIELD",
        field: "sentFriendRequests",
        payload: data,
      });
    });
  };
};

const useGetIncomingFriendRequests = () => {
  const { dispatch } = useProfile();

  return () => {
    sendRequest("/friends/requests/incoming", "GET").then((data) => {
      dispatch({
        type: "SET_FIELD",
        field: "incomingFriendRequests",
        payload: data,
      });
    });
  };
};

const useGetFriends = () => {
  const { dispatch } = useProfile();

  return () => {
    sendRequest("/friends/", "GET").then((data) => {
      dispatch({
        type: "SET_FIELD",
        field: "friends",
        payload: data,
      });
    });
  };
};

const useSetUser = () => {
  const { dispatch } = useProfile();
  const getSentFriendRequests = useGetSentFriendRequests();
  const getIncomingFriendRequests = useGetIncomingFriendRequests();
  const getFriends = useGetFriends();

  return ({
    data,
  }: {
    data: {
      profile_view: string;
      is_sidebar_open: boolean;
      profile_picture: string;
      email: string;
      username: string;
      fullname: string;
    };
  }) => {
    dispatch({
      type: "SET_FIELD",
      field: "profileView",
      payload: data.profile_view,
    });
    dispatch({
      type: "SET_FIELD",
      field: "isSideBarOpen",
      payload: data.is_sidebar_open,
    });
    dispatch({
      type: "SET_FIELD",
      field: "profilePicture",
      payload: data.profile_picture,
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
    getSentFriendRequests();
    getIncomingFriendRequests();
    getFriends();
  };
};

const useGetUser = () => {
  const { dispatch } = useProfile();
  const setUser = useSetUser();

  return () => {
    dispatch({ type: "SET_UPDATE_USER_ERROR_MSG", payload: "" });
    dispatch({ type: "SET_UPDATE_USER_LOADING", payload: true });

    sendRequest("/user/", "GET")
      .then((data) => {
        setUser({ data });
      })
      .catch((error) => {
        dispatch({
          type: "SET_UPDATE_USER_ERROR_MSG",
          payload: error.detail || error,
        });
      })
      .finally(() => {
        dispatch({ type: "SET_UPDATE_USER_LOADING", payload: false });
        dispatch({ type: "SET_CAN_UPDATE_USER", payload: false });
      });
  };
};

const useUpdateUser = () => {
  const { setIsLoggedIn } = useConst();
  const { state, dispatch } = useProfile();

  const {
    profilePicture,
    email,
    username,
    fullname,
    profileView,
    isSideBarOpen,
    canUpdateUser,
  } = state;

  return (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    showUpdateUser: boolean = true
  ) => {
    e.preventDefault();

    if (!canUpdateUser) return;

    dispatch({ type: "SET_UPDATE_USER_ERROR_MSG", payload: "" });

    if (showUpdateUser)
      dispatch({ type: "SET_UPDATE_USER_LOADING", payload: true });

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
      profile_picture: profilePicture,
      email: email,
      username: username,
      fullname: fullname,
      profile_view: profileView,
      is_sidebar_open: isSideBarOpen,
    };
    sendRequest("/user/update", "PATCH", request)
      .then((response) => {
        dispatch({
          type: "SET_GET_USER_INFO",
          payload: false,
        });
        setIsLoggedIn(true);
        if (showUpdateUser) {
          dispatch({ type: "SET_UPDATE_USER_LOADING", payload: false });
        }
        dispatch({ type: "SET_CAN_UPDATE_USER", payload: false });
      })
      .catch((error) =>
        dispatch({
          type: "SET_UPDATE_USER_ERROR_MSG",
          payload: error.detail || error,
        })
      );
  };
};

export { useSetUser, useGetUser, useUpdateUser };
