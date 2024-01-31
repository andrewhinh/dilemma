import { UserBackend, useConst } from "./providers";
import { sendRequest } from "./lib/api";
import { useLogOut } from "./lib/callbacks";

const useGetUser = () => {
  const setUser = useSetUser();
  const getSentFriendRequests = useGetSentFriendRequests();
  const getIncomingFriendRequests = useGetIncomingFriendRequests();
  const getFriends = useGetFriends();
  const logOut = useLogOut();

  return () => {
    sendRequest("/user/", "GET").then((data) => {
      if (data.detail) logOut("/login");
      else {
        setUser(data);
        getSentFriendRequests();
        getIncomingFriendRequests();
        getFriends();
      }
    });
  };
};

const useSetUser = () => {
  const { dispatch: constDispatch } = useConst();

  return (data: UserBackend) => {
    constDispatch({ type: "SET_JOIN_DATE", payload: data.join_date });
    constDispatch({
      type: "SET_PROFILE_PICTURE",
      payload: data.profile_picture,
    });
    constDispatch({ type: "SET_EMAIL", payload: data.email });
    constDispatch({
      type: "SET_USERNAME",
      payload: data.username,
    });
    constDispatch({
      type: "SET_FULLNAME",
      payload: data.fullname,
    });
    constDispatch({
      type: "SET_PROFILE_VIEW",
      payload: data.profile_view,
    });
    constDispatch({
      type: "SET_IS_SIDEBAR_OPEN",
      payload: data.is_sidebar_open,
    });
    constDispatch({
      type: "SET_UID",
      payload: data.uid,
    });
  };
};

const useGetSentFriendRequests = () => {
  const { dispatch } = useConst();

  return () => {
    sendRequest("/friends/requests/sent", "GET").then((data) => {
      dispatch({
        type: "SET_SENT_FRIEND_REQUESTS",
        payload: data,
      });
    });
  };
};

const useGetIncomingFriendRequests = () => {
  const { dispatch } = useConst();

  return () => {
    sendRequest("/friends/requests/incoming", "GET").then((data) => {
      dispatch({
        type: "SET_INCOMING_FRIEND_REQUESTS",
        payload: data,
      });
    });
  };
};

const useGetFriends = () => {
  const { dispatch } = useConst();

  return () => {
    sendRequest("/friends/", "GET").then((data) => {
      dispatch({
        type: "SET_FRIENDS",
        payload: data,
      });
    });
  };
};

export {
  useGetUser,
  useSetUser,
  useGetSentFriendRequests,
  useGetIncomingFriendRequests,
  useGetFriends,
};
