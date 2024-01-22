import { useConst } from "../providers";
import { useSetUser } from "../utils";
import { sendRequest } from "../lib/api";
import { useProfile } from "./providers";

import validator from "validator";

const useUpdateUser = () => {
  const { state: constState } = useConst();
  const { state: profileState, dispatch: profileDispatch } = useProfile();
  const setUser = useSetUser();

  const {
    profilePicture,
    email,
    username,
    fullname,
    profileView,
    isSideBarOpen,
  } = constState;
  const { canUpdateUser } = profileState;

  return (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    showUpdateUser: boolean = true
  ) => {
    e.preventDefault();

    if (!canUpdateUser) return;

    profileDispatch({ type: "SET_UPDATE_USER_ERROR_MSG", payload: "" });

    if (showUpdateUser)
      profileDispatch({ type: "SET_UPDATE_USER_LOADING", payload: true });

    if (email === "") {
      profileDispatch({
        type: "SET_UPDATE_USER_ERROR_MSG",
        payload: "Email cannot be empty",
      });
      profileDispatch({ type: "SET_UPDATE_USER_LOADING", payload: false });
      return;
    }

    if (!validator.isEmail(email)) {
      profileDispatch({
        type: "SET_UPDATE_USER_ERROR_MSG",
        payload: "Email is invalid",
      });
      profileDispatch({ type: "SET_UPDATE_USER_LOADING", payload: false });
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
    sendRequest("/user/update", "PATCH", request).then((data) => {
      if (data.detail) {
        profileDispatch({
          type: "SET_UPDATE_USER_ERROR_MSG",
          payload: data.detail,
        });
        if (showUpdateUser) {
          profileDispatch({
            type: "SET_UPDATE_USER_LOADING",
            payload: false,
          });
        }
      } else {
        setUser(data);
        profileDispatch({
          type: "SET_GET_USER_INFO",
          payload: false,
        });
        if (showUpdateUser) {
          profileDispatch({ type: "SET_UPDATE_USER_LOADING", payload: false });
        }
        profileDispatch({ type: "SET_CAN_UPDATE_USER", payload: false });
      }
    });
  };
};

export { useUpdateUser };
