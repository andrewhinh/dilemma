import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConst } from "../providers";
import { sendRequest } from "./api";
import {
  useSetUser,
} from "../utils";

const useToHome = () => {
  const router = useRouter();
  const setUser = useSetUser();
  const { dispatch } = useConst();

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
    sendRequest("/auth/logout", "POST").then((data) => {
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
          join_date: new Date(),
          provider: "",
          profile_picture: "",
          email: "",
          first_name: "",
          last_name: "",
          account_view: "",
          is_sidebar_open: false,
          uuid: "",
          requester_links: [],
          receiver_links: [],
        });
        router.push(navigateTo);
      }
    });
  };
};

const useRefreshToken = () => {
  const { dispatch } = useConst();
  const setUser = useSetUser();

  return () => {
    return new Promise((resolve, reject) => {
      sendRequest("/auth/token/refresh", "POST").then((data) => {
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
