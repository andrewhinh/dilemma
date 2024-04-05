import { UserBackend, useConst } from "./providers";
import { sendRequest } from "./lib/api";
import { useAccount } from "./account/providers";

const useGetUser = () => {
  const setUser = useSetUser();

  return () => {
    return new Promise((resolve, reject) => {
      sendRequest("/user/profile", "GET").then((data) => {
        if (data.detail) reject();
        else {
          setUser(data);
          resolve(data);
        }
      });
    });
  };
};

const useUpdateUser = () => {
  const { state, dispatch } = useAccount();
  const setUser = useSetUser();
  const { canUpdateUser } = state;

  return (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    request: UserBackend
  ) => {
    e.preventDefault();

    if (!canUpdateUser) return;

    let showUpdateUser = false;
    if (request.profile_picture || request.first_name || request.last_name) {
      showUpdateUser = true;
    }

    dispatch({ type: "SET_UPDATE_USER_ERROR_MSG", payload: "" });

    if (showUpdateUser)
      dispatch({ type: "SET_UPDATE_USER_LOADING", payload: true });

    sendRequest("/user/profile/update", "PATCH", request).then((data) => {
      if (data.detail) {
        dispatch({
          type: "SET_UPDATE_USER_ERROR_MSG",
          payload: data.detail,
        });
        if (showUpdateUser) {
          dispatch({
            type: "SET_UPDATE_USER_LOADING",
            payload: false,
          });
        }
      } else {
        setUser(data);
        if (showUpdateUser) {
          dispatch({ type: "SET_UPDATE_USER_LOADING", payload: false });
        }
        dispatch({ type: "SET_CAN_UPDATE_USER", payload: false });
      }
    });
  };
};

const useSetUser = () => {
  const { dispatch: constDispatch } = useConst();

  return (data: UserBackend) => {
    constDispatch({ type: "SET_JOIN_DATE", payload: data.join_date });
    constDispatch({
      type: "SET_PROVIDER",
      payload: data.provider,
    });
    constDispatch({
      type: "SET_PROFILE_PICTURE",
      payload: data.profile_picture,
    });
    constDispatch({ type: "SET_EMAIL", payload: data.email });
    constDispatch({
      type: "SET_FIRST_NAME",
      payload: data.first_name,
    });
    constDispatch({
      type: "SET_LAST_NAME",
      payload: data.last_name,
    });
    constDispatch({
      type: "SET_ACCOUNT_VIEW",
      payload: data.account_view,
    });
    constDispatch({
      type: "SET_IS_SIDEBAR_OPEN",
      payload: data.is_sidebar_open,
    });
    constDispatch({
      type: "SET_UUID",
      payload: data.uuid,
    });
    constDispatch({
      type: "SET_SENT_CHAT_REQUESTS",
      payload: data.requester_links,
    });
    constDispatch({
      type: "SET_RECEIVED_CHAT_REQUESTS",
      payload: data.receiver_links,
    });
  };
};

export {
  useGetUser,
  useUpdateUser,
  useSetUser,
};
