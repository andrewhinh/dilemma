import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConst } from "../providers";
import { sendRequest } from "./api";
import {
  useSetUser,
  useGetSentFriendRequests,
  useGetIncomingFriendRequests,
  useGetFriends,
} from "../utils";

const useToHome = () => {
  const router = useRouter();
  const setUser = useSetUser();
  const { dispatch } = useConst();
  const getSentFriendRequests = useGetSentFriendRequests();
  const getIncomingFriendRequests = useGetIncomingFriendRequests();
  const getFriends = useGetFriends();

  return (
    route: string,
    formDataObj: object,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    sendRequest(route, "POST", formDataObj).then((data) => {
      if (data.detail) onError(data.detail);
      else {
        onSuccess();
        dispatch({
          type: "SET_VERIFIED_LOGGED_OUT",
          payload: false,
        });
        dispatch({
          type: "SET_LOGGED_IN",
          payload: true,
        });
        setUser(data);
        getSentFriendRequests();
        getIncomingFriendRequests();
        getFriends();
        router.push("/home");
      }
    });
  };
};

const useLogOut = () => {
  const router = useRouter();
  const { dispatch } = useConst();
  const setUser = useSetUser();

  return (navigateTo = "/") => {
    sendRequest("/token/logout", "POST").then((data) => {
      if (data.message) {
        dispatch({
          type: "SET_VERIFIED_LOGGED_OUT",
          payload: true,
        });
        dispatch({
          type: "SET_LOGGED_IN",
          payload: false,
        });
        setUser({
          join_date: "",
          profile_picture: "",
          email: "",
          username: "",
          fullname: "",
          account_view: "",
          is_sidebar_open: false,
          uuid: "",
        });
        dispatch({
          type: "SET_SENT_FRIEND_REQUESTS",
          payload: [],
        });
        dispatch({
          type: "SET_INCOMING_FRIEND_REQUESTS",
          payload: [],
        });
        dispatch({
          type: "SET_FRIENDS",
          payload: [],
        });
        router.push(navigateTo);
      }
    });
  };
};

const useRefreshToken = () => {
  const { dispatch } = useConst();
  const setUser = useSetUser();
  const getSentFriendRequests = useGetSentFriendRequests();
  const getIncomingFriendRequests = useGetIncomingFriendRequests();
  const getFriends = useGetFriends();

  return () => {
    return new Promise((resolve, reject) => {
      sendRequest("/token/refresh", "POST").then((data) => {
        if (data.detail) {
          dispatch({
            type: "SET_VERIFIED_LOGGED_OUT",
            payload: true,
          });
          dispatch({
            type: "SET_LOGGED_IN",
            payload: false,
          });
          reject();
        } else {
          dispatch({
            type: "SET_VERIFIED_LOGGED_OUT",
            payload: false,
          });
          dispatch({
            type: "SET_LOGGED_IN",
            payload: true,
          });
          setUser(data);
          getSentFriendRequests();
          getIncomingFriendRequests();
          getFriends();
          resolve(data);
        }
      });
    });
  };
};

const useAuthEffect = ({
  onSuccess,
  onError,
  dependencies,
}: {
  onSuccess?: () => void;
  onError?: () => void;
  dependencies?: any[];
}) => {
  const { state } = useConst();
  const refreshToken = useRefreshToken();
  const { verifiedLoggedOut, isLoggedIn } = state;

  useEffect(() => {
    if (verifiedLoggedOut) {
      if (onError) onError();
    } else {
      if (isLoggedIn) {
        if (onSuccess) onSuccess();
      } else {
        refreshToken()
          .then(() => {
            if (onSuccess) onSuccess();
          })
          .catch(() => {
            if (onError) onError();
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};

export { useToHome, useLogOut, useRefreshToken, useAuthEffect };
