import { useRouter } from "next/navigation";
import { useConst } from "../providers";
import { sendRequest } from "./api";

const useToProfile = () => {
  const router = useRouter();
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
        dispatch({
          type: "SET_LOGGED_IN",
          payload: true,
        });
        dispatch({
          type: "SET_UID",
          payload: data.uid,
        });
        onSuccess();
        router.push("/profile" + data.uid);
      }
    });
  };
};

const useLogOut = () => {
  const router = useRouter();
  const { dispatch } = useConst();

  return (navigateTo = "/") => {
    sendRequest("/token/logout", "POST").then((data) => {
      if (data.message) {
        dispatch({
          type: "SET_LOGGED_IN",
          payload: false,
        });
        router.push(navigateTo);
      }
    });
  };
};

const useRefreshToken = () => {
  const { dispatch } = useConst();

  return () => {
    return new Promise((resolve, reject) => {
      sendRequest("/token/refresh", "POST").then((data) => {
        if (data.detail) reject();
        else {
          dispatch({
            type: "SET_LOGGED_IN",
            payload: true,
          });
          dispatch({
            type: "SET_UID",
            payload: data.uid,
          });
          resolve(data);
        }
      });
    });
  };
};

export { useToProfile, useLogOut, useRefreshToken };
